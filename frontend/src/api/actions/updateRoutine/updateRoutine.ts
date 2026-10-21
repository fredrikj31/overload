import { apiClient } from "../../client";
import { Routine } from "../createRoutine/types";
import { UpdateRoutineBody, UpdateRoutineResponseSchema } from "./types";

export const updateRoutine = async (
  id: string,
  body: UpdateRoutineBody,
): Promise<Routine> => {
  const response = await apiClient.patch<unknown>(
    `/routines/${encodeURIComponent(id)}`,
    body,
  );
  return UpdateRoutineResponseSchema.parse(response.data).data;
};
