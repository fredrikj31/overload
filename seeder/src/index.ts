import {
  bodyPartSchema,
  createDatabaseClient,
  equipmentSchema,
  exerciseSchema,
  muscleExerciseSchema,
  muscleSchema,
} from "@overload/database";
import { count, inArray, sql } from "drizzle-orm";
import { existsSync } from "node:fs";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ReadableStream } from "node:stream/web";
import * as tar from "tar";
import { config } from "./config";
import { DatasetExercise, datasetSchema } from "./dataset";
import { logger } from "./logger";
import {
  BODY_PARTS,
  MUSCLES,
  mapExerciseMuscles,
  resolveBodyPartSlug,
  toName,
  toSlug,
} from "./mapping";

const DATASET_REPOSITORY = "hasaneyldrm/exercises-dataset";
// Paths (relative to the repository root) extracted from the dataset archive. Everything else is skipped.
const EXTRACTED_PATHS = [
  "data/exercises.json",
  "images/",
  "videos/",
  "LICENSE",
  "NOTICE.md",
];
// Directory inside MEDIA_DIR holding the exercise media, served by the media nginx service
const EXERCISES_DIR = "exercises";
const REF_MARKER_FILE = ".dataset-ref";
const UPSERT_CHUNK_SIZE = 200;

const { bodyPart } = bodyPartSchema;
const { equipment } = equipmentSchema;
const { muscle } = muscleSchema;
const { exercise } = exerciseSchema;
const { muscleExercise } = muscleExerciseSchema;

const database = createDatabaseClient({
  dbHost: config.database.host,
  dbPort: config.database.port,
  dbUser: config.database.user,
  dbPassword: config.database.password,
  dbName: config.database.name,
});

type Transaction = Parameters<Parameters<typeof database.transaction>[0]>[0];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** `excluded."column"`: the row that was rejected by ON CONFLICT */
const excluded = (column: { name: string }) =>
  sql.raw(`excluded."${column.name}"`);

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const requireId = (
  ids: Map<string, string>,
  slug: string,
  label: string,
): string => {
  const id = ids.get(slug);
  if (!id) throw new Error(`No ${label} with slug "${slug}" was upserted`);
  return id;
};

// ---------------------------------------------------------------------------
// Dataset download
// ---------------------------------------------------------------------------

const isAlreadyImported = async (exercisesDir: string): Promise<boolean> => {
  const markerPath = path.join(exercisesDir, REF_MARKER_FILE);
  if (!existsSync(markerPath)) return false;

  const importedRef = (await readFile(markerPath, "utf8")).trim();
  if (importedRef !== config.dataset.ref) return false;

  // The volume could outlive the database, so make sure the rows are there as well
  const [result] = await database.select({ count: count() }).from(exercise);
  return (result?.count ?? 0) > 0;
};

const downloadDataset = async (targetDir: string) => {
  const url = `https://codeload.github.com/${DATASET_REPOSITORY}/tar.gz/${config.dataset.ref}`;
  logger.info({ url }, "Downloading exercises dataset");

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to download dataset: ${response.status} ${response.statusText}`,
    );
  }

  await mkdir(targetDir, { recursive: true });
  await pipeline(
    Readable.fromWeb(response.body as ReadableStream),
    tar.x({
      cwd: targetDir,
      // Archive entries are prefixed with "<repo>-<ref>/"
      strip: 1,
      filter: (entryPath) => {
        const repoPath = entryPath.split("/").slice(1).join("/");
        return EXTRACTED_PATHS.some((keep) => repoPath.startsWith(keep));
      },
    }),
  );
};

const readDataset = async (datasetDir: string): Promise<DatasetExercise[]> => {
  const raw = await readFile(
    path.join(datasetDir, "data", "exercises.json"),
    "utf8",
  );
  const exercises = datasetSchema.parse(JSON.parse(raw));

  const mediaFiles = new Set([
    ...(await readdir(path.join(datasetDir, "images"))).map(
      (file) => `images/${file}`,
    ),
    ...(await readdir(path.join(datasetDir, "videos"))).map(
      (file) => `videos/${file}`,
    ),
  ]);
  const missingMedia = exercises
    .flatMap((ex) => [ex.image, ex.gif_url])
    .filter((file) => !mediaFiles.has(file));
  if (missingMedia.length > 0) {
    throw new Error(
      `Dataset references ${missingMedia.length} missing media files, e.g. ${missingMedia.slice(0, 5).join(", ")}`,
    );
  }

  return exercises;
};

// ---------------------------------------------------------------------------
// Lookup tables: body_part, equipment, muscle
//
// Each is upserted by slug and returns a slug -> id map for the next step.
// Re-importing a row that was soft deleted revives it.
// ---------------------------------------------------------------------------

const upsertBodyParts = async (tx: Transaction) => {
  const rows = BODY_PARTS.map((name) => ({
    slug: toSlug(name),
    name: toName(name),
  }));

  const upserted = await tx
    .insert(bodyPart)
    .values(rows)
    .onConflictDoUpdate({
      target: bodyPart.slug,
      set: {
        name: excluded(bodyPart.name),
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: bodyPart.id, slug: bodyPart.slug });

  return new Map(upserted.map((row) => [row.slug, row.id]));
};

const upsertEquipment = async (
  tx: Transaction,
  exercises: DatasetExercise[],
) => {
  const names = [...new Set(exercises.map((ex) => ex.equipment))].sort();
  const rows = names.map((name) => ({
    slug: toSlug(name),
    name: toName(name),
  }));

  const upserted = await tx
    .insert(equipment)
    .values(rows)
    .onConflictDoUpdate({
      target: equipment.slug,
      set: {
        name: excluded(equipment.name),
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: equipment.id, slug: equipment.slug });

  return new Map(upserted.map((row) => [row.slug, row.id]));
};

const upsertMuscles = async (
  tx: Transaction,
  bodyPartIds: Map<string, string>,
) => {
  const rows = MUSCLES.map((definition) => ({
    slug: definition.slug,
    name: definition.name,
    bodyPartId: requireId(
      bodyPartIds,
      toSlug(definition.bodyPart),
      "body part",
    ),
    graphSlug: definition.graphSlug,
  }));

  const upserted = await tx
    .insert(muscle)
    .values(rows)
    .onConflictDoUpdate({
      target: muscle.slug,
      set: {
        name: excluded(muscle.name),
        bodyPartId: excluded(muscle.bodyPartId),
        graphSlug: excluded(muscle.graphSlug),
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: muscle.id, slug: muscle.slug });

  return new Map(upserted.map((row) => [row.slug, row.id]));
};

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

const upsertExercises = async (
  tx: Transaction,
  exercises: DatasetExercise[],
  bodyPartIds: Map<string, string>,
  equipmentIds: Map<string, string>,
) => {
  const rows = exercises.map((ex) => {
    const bodyPartSlug = resolveBodyPartSlug(ex.body_part);
    return {
      datasetId: ex.id,
      name: ex.name,
      bodyPartId:
        bodyPartSlug === null
          ? null
          : requireId(bodyPartIds, bodyPartSlug, "body part"),
      equipmentId: requireId(equipmentIds, toSlug(ex.equipment), "equipment"),
      instructions: ex.instruction_steps.en,
      imagePath: `${EXERCISES_DIR}/${ex.image}`,
      gifPath: `${EXERCISES_DIR}/${ex.gif_url}`,
      attribution: ex.attribution,
    };
  });

  const exerciseIds = new Map<string, string>();
  for (const batch of chunk(rows, UPSERT_CHUNK_SIZE)) {
    const upserted = await tx
      .insert(exercise)
      .values(batch)
      .onConflictDoUpdate({
        target: exercise.datasetId,
        set: {
          name: excluded(exercise.name),
          bodyPartId: excluded(exercise.bodyPartId),
          equipmentId: excluded(exercise.equipmentId),
          instructions: excluded(exercise.instructions),
          imagePath: excluded(exercise.imagePath),
          gifPath: excluded(exercise.gifPath),
          attribution: excluded(exercise.attribution),
          deletedAt: null,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: exercise.id, datasetId: exercise.datasetId });

    for (const row of upserted) exerciseIds.set(row.datasetId, row.id);
  }

  return exerciseIds;
};

// ---------------------------------------------------------------------------
// Exercise <-> muscle links
//
// Upserted on (exercise_id, muscle_id). Links that exist in the database for
// an imported exercise but are no longer produced by the mapping are removed,
// so a changed alias map or dataset never leaves stale rows behind.
// ---------------------------------------------------------------------------

const syncMuscleExercises = async (
  tx: Transaction,
  exercises: DatasetExercise[],
  exerciseIds: Map<string, string>,
  muscleIds: Map<string, string>,
) => {
  const { links, unmapped } = mapExerciseMuscles(exercises);

  if (unmapped.size > 0) {
    const list = [...unmapped.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, occurrences]) => `"${value}" (${occurrences})`)
      .join(", ");
    throw new Error(
      `Dataset contains ${unmapped.size} muscle names with no alias, add them to ALIASES in mapping.ts: ${list}`,
    );
  }

  const rows = links.map((link) => ({
    exerciseId: requireId(exerciseIds, link.datasetId, "exercise"),
    muscleId: requireId(muscleIds, link.muscleSlug, "muscle"),
    role: link.role,
  }));

  for (const batch of chunk(rows, UPSERT_CHUNK_SIZE)) {
    await tx
      .insert(muscleExercise)
      .values(batch)
      .onConflictDoUpdate({
        target: [muscleExercise.exerciseId, muscleExercise.muscleId],
        set: {
          role: excluded(muscleExercise.role),
          deletedAt: null,
          updatedAt: sql`now()`,
        },
      });
  }

  // Remove links for imported exercises that the mapping no longer produces
  const wanted = new Set(
    rows.map((row) => `${row.exerciseId}:${row.muscleId}`),
  );
  const staleIds: string[] = [];
  for (const batch of chunk([...exerciseIds.values()], UPSERT_CHUNK_SIZE)) {
    const existing = await tx
      .select({
        id: muscleExercise.id,
        exerciseId: muscleExercise.exerciseId,
        muscleId: muscleExercise.muscleId,
      })
      .from(muscleExercise)
      .where(inArray(muscleExercise.exerciseId, batch));

    for (const row of existing) {
      if (!wanted.has(`${row.exerciseId}:${row.muscleId}`))
        staleIds.push(row.id);
    }
  }
  for (const batch of chunk(staleIds, UPSERT_CHUNK_SIZE)) {
    await tx.delete(muscleExercise).where(inArray(muscleExercise.id, batch));
  }

  return { upserted: rows.length, removed: staleIds.length };
};

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

// Swaps the freshly downloaded media into place, replacing the previous import
const publishMedia = async (datasetDir: string, exercisesDir: string) => {
  const previousDir = path.join(config.mediaDir, `.old-${EXERCISES_DIR}`);

  await rm(path.join(datasetDir, "data"), { recursive: true, force: true });
  await writeFile(path.join(datasetDir, REF_MARKER_FILE), config.dataset.ref);

  await rm(previousDir, { recursive: true, force: true });
  if (existsSync(exercisesDir)) await rename(exercisesDir, previousDir);
  await rename(datasetDir, exercisesDir);
  await rm(previousDir, { recursive: true, force: true });
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const seed = async () => {
  const exercisesDir = path.join(config.mediaDir, EXERCISES_DIR);

  if (!config.dataset.force && (await isAlreadyImported(exercisesDir))) {
    logger.info(
      { ref: config.dataset.ref },
      "Exercises dataset already imported, skipping. Set FORCE=true to re-import.",
    );
    return;
  }

  // Downloaded inside MEDIA_DIR so the final move is a rename on the same volume
  const datasetDir = path.join(config.mediaDir, `.tmp-${config.dataset.ref}`);
  await rm(datasetDir, { recursive: true, force: true });

  try {
    await downloadDataset(datasetDir);

    const exercises = await readDataset(datasetDir);
    logger.info({ count: exercises.length }, "Parsed exercises dataset");

    await database.transaction(async (tx) => {
      const bodyPartIds = await upsertBodyParts(tx);
      logger.info({ count: bodyPartIds.size }, "Upserted body parts");

      const equipmentIds = await upsertEquipment(tx, exercises);
      logger.info({ count: equipmentIds.size }, "Upserted equipment");

      const muscleIds = await upsertMuscles(tx, bodyPartIds);
      logger.info({ count: muscleIds.size }, "Upserted muscles");

      const exerciseIds = await upsertExercises(
        tx,
        exercises,
        bodyPartIds,
        equipmentIds,
      );
      logger.info({ count: exerciseIds.size }, "Upserted exercises");

      const links = await syncMuscleExercises(
        tx,
        exercises,
        exerciseIds,
        muscleIds,
      );
      logger.info(links, "Synced exercise <-> muscle links");
    });

    await publishMedia(datasetDir, exercisesDir);
    logger.info(
      { ref: config.dataset.ref, path: exercisesDir },
      "Exercise media published",
    );
  } catch (error) {
    await rm(datasetDir, { recursive: true, force: true });
    throw error;
  }
};

seed()
  .then(async () => {
    await database.$client.end();
  })
  .catch(async (error: unknown) => {
    logger.fatal(error, "Seeding exercises failed");
    await database.$client.end();
    process.exit(1);
  });
