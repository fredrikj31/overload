import { z } from "zod";
import { apiClient } from "../../client";
import { Workout, WorkoutSchema } from "../../../types/workout";

/**
 * Finishes an in-progress workout: no body, the backend sets the end time to
 * now. Fails with 409 (`workout-already-ended`) once the workout has ended and
 * with 404 (`workout-not-found`) for deleted or other users' workouts.
 */
export const finishWorkout = async (
  workoutId: string,
): Promise<
  Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
> => {
  const response = await apiClient.post<unknown>(
    `/workouts/${encodeURIComponent(workoutId)}/finish`,
  );
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
