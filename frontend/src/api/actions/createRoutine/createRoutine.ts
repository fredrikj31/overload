import { apiClient } from "../../client";
import {
  CreateRoutineBody,
  CreateRoutineResponseSchema,
  Routine,
} from "./types";

export const createRoutine = async (
  body: CreateRoutineBody,
): Promise<Routine> => {
  const response = await apiClient.post<unknown>("/routines", body);
  return CreateRoutineResponseSchema.parse(response.data).data;
};
