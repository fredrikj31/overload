import { apiClient } from "../../../client";
import { ListRoutinesResponseSchema, type Routine } from "../types";

export const listRoutines = async (): Promise<Routine[]> => {
  const response = await apiClient.get<unknown>("/routines");
  return ListRoutinesResponseSchema.parse(response.data).data;
};
