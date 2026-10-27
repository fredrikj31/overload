import { z } from "zod";
import { apiClient } from "../../client";
import * as routineSchema from "../../../types/routine";

/** `description` may be left out; the backend stores null. */
export const createRoutine = async (
  body: Pick<routineSchema.Routine, "name"> &
    Partial<Pick<routineSchema.Routine, "description">>,
): Promise<Pick<routineSchema.Routine, "id" | "name" | "description">> => {
  const response = await apiClient.post<unknown>("/routines", body);
  return z
    .object({
      data: routineSchema.RoutineSchema.pick({
        id: true,
        name: true,
        description: true,
      }),
    })
    .parse(response.data).data;
};
