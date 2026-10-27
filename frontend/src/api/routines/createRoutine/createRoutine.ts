import { z } from "zod";
import { apiClient } from "../../client";
import { Routine, RoutineSchema } from "../../../types/routine";

/** `description` may be left out; the backend stores null. */
export const createRoutine = async (
  body: Pick<Routine, "name"> & Partial<Pick<Routine, "description">>,
): Promise<Pick<Routine, "id" | "name" | "description">> => {
  const response = await apiClient.post<unknown>("/routines", body);
  return z
    .object({
      data: RoutineSchema.pick({
        id: true,
        name: true,
        description: true,
      }),
    })
    .parse(response.data).data;
};
