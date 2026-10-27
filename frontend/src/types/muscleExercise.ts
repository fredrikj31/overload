import { z } from "zod";

// Mirrors database/src/schemas/muscle_exercise.ts. The frontend doesn't
// depend on the database package, so the entity is declared here; keep it in
// sync. Request and response shapes are derived from it with pick / omit.

/**
 * How strongly an exercise works a muscle.
 *
 * - primary:   the dataset's target muscle
 * - secondary: one of the dataset's secondary muscles
 */
export const MUSCLE_ROLES = ["primary", "secondary"] as const;
export type MuscleRole = (typeof MUSCLE_ROLES)[number];

export const MuscleExerciseSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  exerciseId: z.uuid(),
  muscleId: z.uuid(),
  role: z.enum(MUSCLE_ROLES),
});
export type MuscleExercise = z.infer<typeof MuscleExerciseSchema>;
