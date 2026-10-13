import { apiClient } from "../../../client";
import { ListExercisesResponseSchema, type ExerciseListItem } from "../types";

export const listExercises = async (): Promise<ExerciseListItem[]> => {
  const response = await apiClient.get<unknown>("/exercises");

  return ListExercisesResponseSchema.parse(response.data).data;
};
