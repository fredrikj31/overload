import { createDatabaseClient, exerciseSchema } from "@overload/database";
import { count, isNotNull, sql } from "drizzle-orm";
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

const DATASET_REPOSITORY = "hasaneyldrm/exercises-dataset";
// Paths (relative to the repository root) extracted from the dataset archive. Everything else is skipped.
const EXTRACTED_PATHS = [
  "data/exercises.json",
  "images/",
  "videos/",
  "LICENSE",
  "NOTICE.md",
];
// Directory inside ASSETS_DIR holding the exercise media, served by the assets nginx service
const EXERCISES_DIR = "exercises";
const REF_MARKER_FILE = ".dataset-ref";
const UPSERT_CHUNK_SIZE = 200;

const { exercise } = exerciseSchema;

const database = createDatabaseClient({
  dbHost: config.database.host,
  dbPort: config.database.port,
  dbUser: config.database.user,
  dbPassword: config.database.password,
  dbName: config.database.name,
});

const isAlreadyImported = async (exercisesDir: string): Promise<boolean> => {
  const markerPath = path.join(exercisesDir, REF_MARKER_FILE);
  if (!existsSync(markerPath)) return false;

  const importedRef = (await readFile(markerPath, "utf8")).trim();
  if (importedRef !== config.dataset.ref) return false;

  // The volume could outlive the database, so make sure the rows are there as well
  const [result] = await database
    .select({ count: count() })
    .from(exercise)
    .where(isNotNull(exercise.datasetId));
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

const upsertExercises = async (exercises: DatasetExercise[]) => {
  const rows = exercises.map((ex) => ({
    datasetId: ex.id,
    name: ex.name,
    bodyPart: ex.body_part,
    equipment: ex.equipment,
    target: ex.target,
    secondaryMuscles: ex.secondary_muscles,
    instructions: ex.instruction_steps.en,
    imagePath: `${EXERCISES_DIR}/${ex.image}`,
    gifPath: `${EXERCISES_DIR}/${ex.gif_url}`,
    attribution: ex.attribution,
  }));

  const excluded = (column: { name: string }) =>
    sql.raw(`excluded."${column.name}"`);

  await database.transaction(async (tx) => {
    for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
      await tx
        .insert(exercise)
        .values(rows.slice(i, i + UPSERT_CHUNK_SIZE))
        .onConflictDoUpdate({
          target: exercise.datasetId,
          set: {
            name: excluded(exercise.name),
            bodyPart: excluded(exercise.bodyPart),
            equipment: excluded(exercise.equipment),
            target: excluded(exercise.target),
            secondaryMuscles: excluded(exercise.secondaryMuscles),
            instructions: excluded(exercise.instructions),
            imagePath: excluded(exercise.imagePath),
            gifPath: excluded(exercise.gifPath),
            attribution: excluded(exercise.attribution),
            updatedAt: sql`now()`,
          },
        });
    }
  });

  return rows.length;
};

// Swaps the freshly downloaded media into place, replacing the previous import
const publishMedia = async (datasetDir: string, exercisesDir: string) => {
  const previousDir = path.join(config.assetsDir, `.old-${EXERCISES_DIR}`);

  await rm(path.join(datasetDir, "data"), { recursive: true, force: true });
  await writeFile(path.join(datasetDir, REF_MARKER_FILE), config.dataset.ref);

  await rm(previousDir, { recursive: true, force: true });
  if (existsSync(exercisesDir)) await rename(exercisesDir, previousDir);
  await rename(datasetDir, exercisesDir);
  await rm(previousDir, { recursive: true, force: true });
};

const seed = async () => {
  const exercisesDir = path.join(config.assetsDir, EXERCISES_DIR);

  if (!config.dataset.force && (await isAlreadyImported(exercisesDir))) {
    logger.info(
      { ref: config.dataset.ref },
      "Exercises dataset already imported, skipping. Set FORCE=true to re-import.",
    );
    return;
  }

  // Downloaded inside ASSETS_DIR so the final move is a rename on the same volume
  const datasetDir = path.join(config.assetsDir, `.tmp-${config.dataset.ref}`);
  await rm(datasetDir, { recursive: true, force: true });

  try {
    await downloadDataset(datasetDir);

    const exercises = await readDataset(datasetDir);
    logger.info({ count: exercises.length }, "Parsed exercises dataset");

    const upserted = await upsertExercises(exercises);
    logger.info({ count: upserted }, "Upserted exercises into database");

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
