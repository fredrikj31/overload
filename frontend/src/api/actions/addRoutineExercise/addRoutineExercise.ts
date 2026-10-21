import { apiClient } from "../../client";
import {
  AddRoutineExerciseBody,
  AddRoutineExerciseResponseSchema,
  RoutineExercise,
} from "./types";

export const addRoutineExercise = async (
  routineId: string,
  body: AddRoutineExerciseBody,
): Promise<RoutineExercise> => {
  const response = await apiClient.post<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises`,
    body,
  );
  return AddRoutineExerciseResponseSchema.parse(response.data).data;
};
