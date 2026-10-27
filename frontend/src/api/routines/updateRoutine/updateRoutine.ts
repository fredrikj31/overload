import { z } from "zod";
import { apiClient } from "../../client";
import * as routineSchema from "../../../types/routine";

/**
 * Every field is optional so callers can send only what changed. A `null`
 * description clears it. The backend rejects an empty body, so callers must
 * include at least one field.
 */
export const updateRoutine = async (
  id: string,
  body: Partial<Pick<routineSchema.Routine, "name" | "description">>,
): Promise<Pick<routineSchema.Routine, "id" | "name" | "description">> => {
  const response = await apiClient.patch<unknown>(
    `/routines/${encodeURIComponent(id)}`,
    body,
  );
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
