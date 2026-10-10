import type { muscleSchema, muscleExerciseSchema } from "@overload/database";
import type { DatasetExercise } from "./dataset";

type GraphSlug = muscleSchema.GraphSlug;
type MuscleRole = muscleExerciseSchema.MuscleRole;

// ---------------------------------------------------------------------------
// Slugs
// ---------------------------------------------------------------------------

/** "body weight" -> "body_weight", "ez barbell" -> "ez_barbell" */
export const toSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** "body weight" -> "Body weight" */
export const toName = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

// ---------------------------------------------------------------------------
// Body parts
//
// The dataset's `body_part` values, minus "cardio": it is not a region of the
// body and no muscle belongs to it. Cardio exercises get no body part.
// ---------------------------------------------------------------------------

export const BODY_PARTS = [
  "back",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
] as const;
export type BodyPartName = (typeof BODY_PARTS)[number];

const NO_BODY_PART = new Set(["cardio"]);

/**
 * Resolves a dataset `body_part` value to a body part slug, or null for
 * values that intentionally have no body part. Throws on unknown values so a
 * dataset update cannot slip through silently.
 */
export const resolveBodyPartSlug = (raw: string): string | null => {
  const key = raw.trim().toLowerCase();
  if (NO_BODY_PART.has(key)) return null;
  if (!(BODY_PARTS as readonly string[]).includes(key)) {
    throw new Error(`Unknown body_part "${raw}" in dataset`);
  }
  return toSlug(key);
};

// ---------------------------------------------------------------------------
// Canonical muscles
//
// This is OUR vocabulary, not the dataset's. One row per region we want to be
// able to light up on the body graph. The slug is the stable upsert key.
// ---------------------------------------------------------------------------

export interface MuscleDefinition {
  slug: string;
  name: string;
  bodyPart: BodyPartName;
  /** Region to highlight on the body graph. Null if the graph has no region for it. */
  graphSlug: GraphSlug | null;
}

// prettier-ignore
export const MUSCLES: MuscleDefinition[] = [
  // waist
  { slug: "abs",               name: "Abs",               bodyPart: "waist",      graphSlug: "abs" },
  { slug: "obliques",          name: "Obliques",          bodyPart: "waist",      graphSlug: "obliques" },
  // back
  { slug: "lats",              name: "Lats",              bodyPart: "back",       graphSlug: "upper-back" }, // graph has no lats region; upper-back is the closest
  { slug: "upper_back",        name: "Upper back",        bodyPart: "back",       graphSlug: "upper-back" },
  { slug: "traps",             name: "Traps",             bodyPart: "back",       graphSlug: "trapezius" },
  { slug: "lower_back",        name: "Lower back",        bodyPart: "back",       graphSlug: "lower-back" },
  // chest
  { slug: "pectorals",         name: "Pectorals",         bodyPart: "chest",      graphSlug: "chest" },
  { slug: "serratus_anterior", name: "Serratus anterior", bodyPart: "chest",      graphSlug: "chest" }, // sits on the ribcage next to the pecs
  // shoulders
  { slug: "delts",             name: "Deltoids",          bodyPart: "shoulders",  graphSlug: "deltoids" },
  { slug: "rotator_cuff",      name: "Rotator cuff",      bodyPart: "shoulders",  graphSlug: "deltoids" }, // lies under the deltoid
  // upper arms
  { slug: "biceps",            name: "Biceps",            bodyPart: "upper arms", graphSlug: "biceps" },
  { slug: "triceps",           name: "Triceps",           bodyPart: "upper arms", graphSlug: "triceps" },
  // lower arms
  { slug: "forearms",          name: "Forearms",          bodyPart: "lower arms", graphSlug: "forearm" },
  // upper legs
  { slug: "quads",             name: "Quadriceps",        bodyPart: "upper legs", graphSlug: "quadriceps" },
  { slug: "hamstrings",        name: "Hamstrings",        bodyPart: "upper legs", graphSlug: "hamstring" },
  { slug: "glutes",            name: "Glutes",            bodyPart: "upper legs", graphSlug: "gluteal" },
  { slug: "hip_flexors",       name: "Hip flexors",       bodyPart: "upper legs", graphSlug: "quadriceps" }, // rectus femoris is a hip flexor; nearest front-of-hip region
  { slug: "adductors",         name: "Adductors",         bodyPart: "upper legs", graphSlug: "adductors" },
  { slug: "abductors",         name: "Abductors",         bodyPart: "upper legs", graphSlug: "gluteal" }, // glute medius/minimus are the hip abductors
  // lower legs
  { slug: "calves",            name: "Calves",            bodyPart: "lower legs", graphSlug: "calves" },
  { slug: "tibialis_anterior", name: "Tibialis anterior", bodyPart: "lower legs", graphSlug: "tibialis" },
  // neck
  { slug: "neck",              name: "Neck",              bodyPart: "neck",       graphSlug: "neck" },
];

// ---------------------------------------------------------------------------
// Alias map: every raw string found in `target` / `secondary_muscles` ->
// canonical muscle slug. `null` means "known, but intentionally not a muscle".
// Anything not listed here is reported as unmapped so the dataset can't drift
// silently.
// ---------------------------------------------------------------------------

const ALIASES: Record<string, string | null> = {
  // waist
  abs: "abs",
  abdominals: "abs",
  core: "abs",
  "lower abs": "abs",
  obliques: "obliques",

  // back
  lats: "lats",
  "latissimus dorsi": "lats",
  back: "upper_back",
  "upper back": "upper_back",
  rhomboids: "upper_back",
  traps: "traps",
  trapezius: "traps",
  "lower back": "lower_back",
  spine: "lower_back", // dataset uses "spine" as target for back extensions / hyperextensions

  // chest
  pectorals: "pectorals",
  chest: "pectorals",
  "upper chest": "pectorals",
  "serratus anterior": "serratus_anterior",

  // shoulders
  delts: "delts",
  deltoids: "delts",
  shoulders: "delts",
  "rear deltoids": "delts",
  "rotator cuff": "rotator_cuff",

  // upper arms
  biceps: "biceps",
  brachialis: "biceps",
  triceps: "triceps",

  // lower arms
  forearms: "forearms",
  "wrist flexors": "forearms",
  "wrist extensors": "forearms",
  "grip muscles": "forearms",
  wrists: "forearms",
  hands: "forearms",

  // upper legs
  quads: "quads",
  quadriceps: "quads",
  hamstrings: "hamstrings",
  glutes: "glutes",
  "hip flexors": "hip_flexors",
  adductors: "adductors",
  "inner thighs": "adductors",
  groin: "adductors",
  abductors: "abductors",

  // lower legs
  calves: "calves",
  soleus: "calves",
  ankles: "calves",
  "ankle stabilizers": "calves",
  feet: "calves",
  shins: "tibialis_anterior",

  // neck
  "levator scapulae": "neck",
  sternocleidomastoid: "neck",

  // not muscles: cardio exercises get no primary muscle row,
  // their secondary muscles still map normally.
  "cardiovascular system": null,
};

const muscleBySlug = new Map(MUSCLES.map((m) => [m.slug, m]));

for (const [alias, slug] of Object.entries(ALIASES)) {
  if (slug !== null && !muscleBySlug.has(slug)) {
    throw new Error(`Alias "${alias}" points to unknown muscle slug "${slug}"`);
  }
}

// ---------------------------------------------------------------------------
// Exercise -> muscle mapping
// ---------------------------------------------------------------------------

export interface ExerciseMuscleLink {
  datasetId: string;
  muscleSlug: string;
  role: MuscleRole;
}

export interface MappingResult {
  links: ExerciseMuscleLink[];
  /** Raw strings with no alias, with how often each occurred. */
  unmapped: Map<string, number>;
}

/**
 * Builds the junction rows for every exercise.
 *
 * - target            -> primary
 * - secondary_muscles -> secondary
 * - muscle_group      -> ignored: in this dataset it is always just
 *                        secondary_muscles[0], so it carries no extra info.
 *
 * If several raw values collapse onto the same canonical muscle (e.g. target
 * "biceps" + secondary "brachialis"), the row is kept once with the strongest
 * role (primary wins over secondary).
 */
export const mapExerciseMuscles = (
  exercises: DatasetExercise[],
): MappingResult => {
  const unmapped = new Map<string, number>();

  const resolveMuscleSlug = (raw: string): string | null => {
    const key = raw.trim().toLowerCase();
    if (!(key in ALIASES)) {
      unmapped.set(key, (unmapped.get(key) ?? 0) + 1);
      return null;
    }
    return ALIASES[key] ?? null;
  };

  const links = exercises.flatMap((exercise) => {
    const roleBySlug = new Map<string, MuscleRole>();

    const add = (raw: string, role: MuscleRole) => {
      const slug = resolveMuscleSlug(raw);
      if (slug === null) return;
      if (roleBySlug.get(slug) === "primary") return;
      roleBySlug.set(slug, role);
    };

    add(exercise.target, "primary");
    for (const secondary of exercise.secondary_muscles) {
      add(secondary, "secondary");
    }

    return [...roleBySlug.entries()].map(([muscleSlug, role]) => ({
      datasetId: exercise.id,
      muscleSlug,
      role,
    }));
  });

  return { links, unmapped };
};
