import { z } from "zod";

// Mirrors database/src/schemas/workout_exercise.ts. The frontend doesn't
// depend on the database package, so the entity is declared here; keep it in
// sync. Request and response shapes are derived from it with pick / omit.

export const WorkoutExerciseSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  workoutId: z.uuid(),
  exerciseId: z.uuid(),
  // The routine slot this was pre-filled from; null for ad-hoc exercises.
  routineExerciseId: z.uuid().nullable(),
  // 0-based order within the workout, assigned by the server.
  position: z.int().min(0),
});
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;
