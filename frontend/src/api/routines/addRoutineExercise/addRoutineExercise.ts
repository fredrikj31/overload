import { z } from "zod";
import { apiClient } from "../../client";
import {
  RoutineExercise,
  RoutineExerciseSchema,
} from "../../../types/routineExercise";

/** `position` is assigned by the server (appended at the end). */
export const addRoutineExercise = async (
  routineId: string,
  body: Pick<RoutineExercise, "exerciseId">,
): Promise<
  Pick<RoutineExercise, "id" | "routineId" | "exerciseId" | "position">
> => {
  const response = await apiClient.post<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises`,
    body,
  );
  return z
    .object({
      data: RoutineExerciseSchema.pick({
        id: true,
        routineId: true,
        exerciseId: true,
        position: true,
      }),
    })
    .parse(response.data).data;
};
