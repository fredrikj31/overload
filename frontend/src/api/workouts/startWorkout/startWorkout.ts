import { z } from "zod";
import { apiClient } from "../../client";
import { Workout, WorkoutSchema } from "../../../types/workout";

/**
 * Starts an empty workout: no body, the backend names it and sets the start
 * time. Fails with 409 (`workout-already-in-progress`) while the user already
 * has a workout in progress.
 */
export const startWorkout = async (): Promise<
  Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
> => {
  const response = await apiClient.post<unknown>("/workouts");
  return z
    .object({
      data: WorkoutSchema.pick({
        id: true,
        routineId: true,
        name: true,
        startedAt: true,
        endedAt: true,
      }),
    })
    .parse(response.data).data;
};
