import { apiClient } from "../../client";
import { RoutineExerciseSet } from "../addRoutineExerciseSet/types";
import {
  UpdateRoutineExerciseSetBody,
  UpdateRoutineExerciseSetResponseSchema,
} from "./types";

export const updateRoutineExerciseSet = async (
  routineId: string,
  routineExerciseId: string,
  setId: string,
  body: UpdateRoutineExerciseSetBody,
): Promise<RoutineExerciseSet> => {
  const response = await apiClient.patch<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises/${encodeURIComponent(routineExerciseId)}/sets/${encodeURIComponent(setId)}`,
    body,
  );

  return UpdateRoutineExerciseSetResponseSchema.parse(response.data).data;
};
