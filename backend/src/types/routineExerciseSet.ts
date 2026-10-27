import { routineExerciseSetSchema } from "@overload/database";
import { z } from "zod";

/** Path params for routes that address one exercise slot inside a routine. */
export const RoutineExerciseParamsSchema = z.object({
  id: z.uuid(),
  routineExerciseId: z.uuid(),
});
export type RoutineExerciseParams = z.infer<typeof RoutineExerciseParamsSchema>;

/**
 * Request body for adding a set to a routine exercise. `routineExerciseId`
 * comes from the path, `position` is assigned by the server (appended at the
 * end) and `weightUnit` falls back to "kg" when omitted.
 *
 * TODO: default `weightUnit` from the user's preferred unit once that is
 * stored on the user.
 */
export const AddRoutineExerciseSetBodySchema =
  routineExerciseSetSchema.CreateRoutineExerciseSetSchema.omit({
    routineExerciseId: true,
    position: true,
  }).extend({
    weightUnit: z.enum(routineExerciseSetSchema.WEIGHT_UNITS).optional(),
  });
export type AddRoutineExerciseSetBody = z.infer<
  typeof AddRoutineExerciseSetBodySchema
>;

export const RoutineExerciseSetSchema =
  routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
    id: true,
    routineExerciseId: true,
    position: true,
    type: true,
    reps: true,
    weightUnit: true,
    weight: true,
  });
export type RoutineExerciseSet = z.infer<typeof RoutineExerciseSetSchema>;

export const AddRoutineExerciseSetResponseSchema = z.object({
  data: RoutineExerciseSetSchema,
});

/** Path params for routes that address a single set in an exercise slot. */
export const RoutineExerciseSetParamsSchema =
  RoutineExerciseParamsSchema.extend({ setId: z.uuid() });
export type RoutineExerciseSetParams = z.infer<
  typeof RoutineExerciseSetParamsSchema
>;

/**
 * Request body for updating a set. Every field is optional, but at least one
 * must be provided. `routineExerciseId` and `position` are not editable here.
 */
export const UpdateRoutineExerciseSetBodySchema =
  routineExerciseSetSchema.UpdateRoutineExerciseSetSchema.omit({
    routineExerciseId: true,
    position: true,
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateRoutineExerciseSetBody = z.infer<
  typeof UpdateRoutineExerciseSetBodySchema
>;

export const UpdateRoutineExerciseSetResponseSchema = z.object({
  data: RoutineExerciseSetSchema,
});
