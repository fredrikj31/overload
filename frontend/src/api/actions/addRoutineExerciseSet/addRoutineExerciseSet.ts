import { z } from "zod";
import { apiClient } from "../../client";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";

/**
 * `position` is assigned by the server (appended at the end). `type` defaults
 * to normal and `weightUnit` to kg when omitted. A null `weight` means
 * bodyweight / no added load.
 */
export const addRoutineExerciseSet = async (
  routineId: string,
  routineExerciseId: string,
  body: Pick<routineExerciseSetSchema.RoutineExerciseSet, "reps"> &
    Partial<
      Pick<
        routineExerciseSetSchema.RoutineExerciseSet,
        "type" | "weightUnit" | "weight"
      >
    >,
): Promise<
  Pick<
    routineExerciseSetSchema.RoutineExerciseSet,
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
      data: routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
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
