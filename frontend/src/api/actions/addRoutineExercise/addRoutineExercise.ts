import { z } from "zod";
import { apiClient } from "../../client";
import * as routineExerciseSchema from "../../../types/routineExercise";

/** `position` is assigned by the server (appended at the end). */
export const addRoutineExercise = async (
  routineId: string,
  body: Pick<routineExerciseSchema.RoutineExercise, "exerciseId">,
): Promise<
  Pick<
    routineExerciseSchema.RoutineExercise,
    "id" | "routineId" | "exerciseId" | "position"
  >
> => {
  const response = await apiClient.post<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises`,
    body,
  );
  return z
    .object({
      data: routineExerciseSchema.RoutineExerciseSchema.pick({
        id: true,
        routineId: true,
        exerciseId: true,
        position: true,
      }),
    })
    .parse(response.data).data;
};
