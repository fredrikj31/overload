import { z } from "zod";

// Mirrors database/src/schemas/workout.ts. The frontend doesn't depend on the
// database package, so the entity is declared here; keep it in sync,
// including the user-facing messages, which the forms show as-is.
// Request and response shapes are derived from it with pick / omit.

export const WorkoutSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  userId: z.string().min(1),
  // The routine the workout was started from; null for an empty workout.
  routineId: z.uuid().nullable(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  startedAt: z.iso.datetime(),
  // Null while the workout is in progress.
  endedAt: z.iso.datetime().nullable(),
});
export type Workout = z.infer<typeof WorkoutSchema>;
