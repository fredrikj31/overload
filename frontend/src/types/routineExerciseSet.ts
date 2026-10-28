import { z } from "zod";
import { WEIGHT_UNITS } from "./weightUnit";

// Mirrors database/src/schemas/routine_exercise_set.ts. The frontend doesn't
// depend on the database package, so the entity is declared here; keep it in
// sync, including the user-facing messages, which the forms show as-is.
// Request and response shapes are derived from it with pick / omit.

/**
 * How a planned set is meant to be performed.
 *
 * - normal:  a regular working set
 * - warmup:  a lighter preparatory set
 * - failure: taken to muscular failure / as many reps as possible
 * - dropset: weight reduced immediately after the previous set
 */
export const SET_TYPES = ["normal", "warmup", "failure", "dropset"] as const;
export type SetType = (typeof SET_TYPES)[number];

export const RoutineExerciseSetSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  routineExerciseId: z.uuid(),
  // 0-based order within the exercise slot, assigned by the server.
  position: z.int().min(0),
  type: z.enum(SET_TYPES),
  reps: z
    .number({ error: "Reps is required" })
    .int("Reps must be a whole number")
    .min(0, "Reps can't be negative"),
  // Stored per set, in the unit the set was entered in.
  weightUnit: z.enum(WEIGHT_UNITS),
  // numeric(6,2), stored as entered in `weightUnit`; null means bodyweight.
  weight: z
    .number({ error: "Weight must be a number" })
    .min(0, "Weight can't be negative")
    .max(9999.99, "Weight must be 9999.99 or less")
    .nullable(),
});
export type RoutineExerciseSet = z.infer<typeof RoutineExerciseSetSchema>;
