import { z } from "zod";

// Mirrors database/src/schemas/routine_exercise.ts. The frontend doesn't
// depend on the database package, so the entity is declared here; keep it in
// sync. Request and response shapes are derived from it with pick / omit.

export const RoutineExerciseSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  routineId: z.uuid(),
  exerciseId: z.uuid(),
  // 0-based slot within the routine, assigned by the server.
  position: z.int().min(0),
});
export type RoutineExercise = z.infer<typeof RoutineExerciseSchema>;
