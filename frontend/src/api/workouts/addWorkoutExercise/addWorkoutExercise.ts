import { z } from "zod";
import { apiClient } from "../../client";
import {
  WorkoutExercise,
  WorkoutExerciseSchema,
} from "../../../types/workoutExercise";

/**
 * Appends an exercise to an in-progress workout. `position` is assigned by
 * the server and `routineExerciseId` stays null for exercises added ad hoc.
 * Fails with 409 (`workout-already-ended`) once the workout has ended and
 * with 404 (`workout-not-found` / `exercise-not-found`) when either side is
 * deleted or belongs to another user.
 */
export const addWorkoutExercise = async (
  workoutId: string,
  body: Pick<WorkoutExercise, "exerciseId">,
): Promise<
  Pick<
    WorkoutExercise,
    "id" | "workoutId" | "exerciseId" | "routineExerciseId" | "position"
  >
> => {
  const response = await apiClient.post<unknown>(
    `/workouts/${encodeURIComponent(workoutId)}/exercises`,
    body,
  );
  return z
    .object({
      data: WorkoutExerciseSchema.pick({
        id: true,
        workoutId: true,
        exerciseId: true,
        routineExerciseId: true,
        position: true,
      }),
    })
    .parse(response.data).data;
};
