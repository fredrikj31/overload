import { z } from "zod";
import { apiClient } from "../../client";
import { Workout, WorkoutSchema } from "../../../types/workout";

/** Fails with 404 (`workout-not-found`) for deleted or other users' workouts. */
export const getWorkout = async (
  workoutId: string,
): Promise<
  Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
> => {
  const response = await apiClient.get<unknown>(`/workouts/${workoutId}`);
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
