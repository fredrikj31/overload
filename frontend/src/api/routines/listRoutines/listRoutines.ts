import { z } from "zod";
import { apiClient } from "../../client";
import * as routineSchema from "../../../types/routine";

export const listRoutines = async (): Promise<
  Pick<routineSchema.Routine, "id" | "name" | "description">[]
> => {
  const response = await apiClient.get<unknown>("/routines");
  return z
    .object({
      data: z.array(
        routineSchema.RoutineSchema.pick({
          id: true,
          name: true,
          description: true,
        }),
      ),
    })
    .parse(response.data).data;
};
