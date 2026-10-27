import { apiClient } from "../../client";
import {
  AddRoutineExerciseSetBody,
  AddRoutineExerciseSetResponseSchema,
  RoutineExerciseSet,
} from "./types";

export const addRoutineExerciseSet = async (
  routineId: string,
  routineExerciseId: string,
  body: AddRoutineExerciseSetBody,
): Promise<RoutineExerciseSet> => {
  const response = await apiClient.post<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises/${encodeURIComponent(routineExerciseId)}/sets`,
    body,
  );

  return AddRoutineExerciseSetResponseSchema.parse(response.data).data;
};
