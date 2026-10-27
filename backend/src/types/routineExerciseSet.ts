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
