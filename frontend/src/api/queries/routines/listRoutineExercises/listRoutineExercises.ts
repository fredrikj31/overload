import { apiClient } from "../../../client";
import {
  ListRoutineExercisesResponseSchema,
  type RoutineExerciseListItem,
} from "../types";

export const listRoutineExercises = async (
  routineId: string,
): Promise<RoutineExerciseListItem[]> => {
  const response = await apiClient.get<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises`,
  );

  return ListRoutineExercisesResponseSchema.parse(response.data).data;
};
