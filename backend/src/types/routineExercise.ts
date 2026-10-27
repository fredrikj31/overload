import { routineExerciseSchema } from "@overload/database";
import { z } from "zod";
import { ExerciseSummarySchema } from "./exercise";
import { RoutineExerciseSetSchema } from "./routineExerciseSet";

/**
 * Request body for adding an exercise to a routine. `routineId` comes from
 * the path and `position` is assigned by the server (appended at the end).
 */
export const AddRoutineExerciseBodySchema =
  routineExerciseSchema.CreateRoutineExerciseSchema.pick({ exerciseId: true });
export type AddRoutineExerciseBody = z.infer<
  typeof AddRoutineExerciseBodySchema
>;

export const RoutineExerciseSchema =
  routineExerciseSchema.RoutineExerciseSchema.pick({
    id: true,
    routineId: true,
    exerciseId: true,
    position: true,
  });
export type RoutineExercise = z.infer<typeof RoutineExerciseSchema>;

export const AddRoutineExerciseResponseSchema = z.object({
  data: RoutineExerciseSchema,
});

/**
 * A routine exercise together with the exercise it points at and its planned
 * sets, ordered by position.
 */
export const RoutineExerciseListItemSchema = RoutineExerciseSchema.extend({
  exercise: ExerciseSummarySchema,
  sets: z.array(RoutineExerciseSetSchema),
});
export type RoutineExerciseListItem = z.infer<
  typeof RoutineExerciseListItemSchema
>;

export const ListRoutineExercisesResponseSchema = z.object({
  data: z.array(RoutineExerciseListItemSchema),
});
