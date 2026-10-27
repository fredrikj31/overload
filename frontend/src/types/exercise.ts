import { z } from "zod";

// Mirrors database/src/schemas/exercise.ts. The frontend doesn't depend on
// the database package, so the entity is declared here; keep it in sync.
// Request and response shapes are derived from it with pick / omit.

export const ExerciseSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  // Id from the exercises dataset, e.g. "0025".
  datasetId: z.string().regex(/^[0-9]{4}$/),
  name: z.string().trim().min(1).max(200),
  // Nullable: cardio exercises have no body region.
  bodyPartId: z.uuid().nullable(),
  equipmentId: z.uuid(),
  // English step-by-step instructions.
  instructions: z.array(z.string().trim().min(1).max(2000)).max(50),
  // Paths relative to the media root, served under /media/.
  imagePath: z.string().min(1).max(500),
  gifPath: z.string().min(1).max(500),
  attribution: z.string().max(500),
});
export type Exercise = z.infer<typeof ExerciseSchema>;
