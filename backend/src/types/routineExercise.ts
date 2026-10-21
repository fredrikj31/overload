import { routineExerciseSchema } from "@overload/database";
import { z } from "zod";

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
