import { z } from "zod";

// Mirrors database/src/schemas/muscle.ts. The frontend doesn't depend on the
// database package, so the entity is declared here; keep it in sync.
// Request and response shapes are derived from it with pick / omit.

/** Region ids understood by react-muscle-highlighter. */
export const GRAPH_SLUGS = [
  "abs",
  "adductors",
  "ankles",
  "biceps",
  "calves",
  "chest",
  "deltoids",
  "feet",
  "forearm",
  "gluteal",
  "hamstring",
  "hands",
  "hair",
  "head",
  "knees",
  "lower-back",
  "neck",
  "obliques",
  "quadriceps",
  "tibialis",
  "trapezius",
  "triceps",
  "upper-back",
] as const;
export type GraphSlug = (typeof GRAPH_SLUGS)[number];

export const MuscleSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  name: z.string().trim().min(1).max(100),
  slug: z.string().min(1).max(64),
  bodyPartId: z.uuid(),
  // Region to highlight on the body graph. Null if the graph has no region for it.
  graphSlug: z.enum(GRAPH_SLUGS).nullable(),
});
export type Muscle = z.infer<typeof MuscleSchema>;
