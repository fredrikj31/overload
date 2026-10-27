import { z } from "zod";
import { apiClient } from "../../client";
import {
  RoutineExerciseSet,
  RoutineExerciseSetSchema,
} from "../../../types/routineExerciseSet";

/**
 * `position` is assigned by the server (appended at the end). `type` defaults
 * to normal and `weightUnit` to kg when omitted. A null `weight` means
 * bodyweight / no added load.
 */
export const addRoutineExerciseSet = async (
  routineId: string,
  routineExerciseId: string,
  body: Pick<RoutineExerciseSet, "reps"> &
    Partial<Pick<RoutineExerciseSet, "type" | "weightUnit" | "weight">>,
): Promise<
  Pick<
    RoutineExerciseSet,
    | "id"
    | "routineExerciseId"
    | "position"
    | "type"
    | "reps"
    | "weightUnit"
    | "weight"
  >
> => {
  const response = await apiClient.post<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises/${encodeURIComponent(routineExerciseId)}/sets`,
    body,
  );

  return z
    .object({
      data: RoutineExerciseSetSchema.pick({
        id: true,
        routineExerciseId: true,
        position: true,
        type: true,
        reps: true,
        weightUnit: true,
        weight: true,
      }),
    })
    .parse(response.data).data;
};
