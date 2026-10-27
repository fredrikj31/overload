import { z } from "zod";
import { apiClient } from "../../client";
import { Routine, RoutineSchema } from "../../../types/routine";

export const listRoutines = async (): Promise<
  Pick<Routine, "id" | "name" | "description">[]
> => {
  const response = await apiClient.get<unknown>("/routines");
  return z
    .object({
      data: z.array(
        RoutineSchema.pick({
          id: true,
          name: true,
          description: true,
        }),
      ),
    })
    .parse(response.data).data;
};
