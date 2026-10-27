import { z } from "zod";

// Mirrors backend/src/types/routineExerciseSet.ts. The frontend doesn't
// depend on the backend or database packages, so the request and response
// shapes are declared here. Keep the limits in sync with
// database/src/schemas/routine_exercise_set.ts.

export const SET_TYPES = ["normal", "warmup", "failure", "dropset"] as const;
export type SetType = (typeof SET_TYPES)[number];

export const WEIGHT_UNITS = ["kg", "lb"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

/**
 * Request body for adding a set. `position` is assigned by the server
 * (appended at the end). `type` defaults to normal and `weightUnit` to kg
 * when omitted. A null `weight` means bodyweight / no added load.
 */
export const AddRoutineExerciseSetBodySchema = z.object({
  reps: z
    .number({ error: "Reps is required" })
    .int("Reps must be a whole number")
    .min(0, "Reps can't be negative"),
  type: z.enum(SET_TYPES).optional(),
  weightUnit: z.enum(WEIGHT_UNITS).optional(),
  weight: z
    .number({ error: "Weight must be a number" })
    .min(0, "Weight can't be negative")
    .max(9999.99, "Weight must be 9999.99 or less")
    .nullable()
    .optional(),
});

export const RoutineExerciseSetSchema = z.object({
  id: z.string(),
  routineExerciseId: z.string(),
  // 0-based order within the exercise slot, assigned by the server.
  position: z.number().int().min(0),
  type: z.enum(SET_TYPES),
  reps: z.number().int().min(0),
  weightUnit: z.enum(WEIGHT_UNITS),
  weight: z.number().nullable(),
});

export const AddRoutineExerciseSetResponseSchema = z.object({
  data: RoutineExerciseSetSchema,
});

export type AddRoutineExerciseSetBody = z.infer<
  typeof AddRoutineExerciseSetBodySchema
>;
export type RoutineExerciseSet = z.infer<typeof RoutineExerciseSetSchema>;
