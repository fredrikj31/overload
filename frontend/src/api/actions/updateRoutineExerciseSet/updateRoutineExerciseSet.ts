import { z } from "zod";
import { apiClient } from "../../client";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";

/**
 * Every field is optional so callers can send only what changed. A `null`
 * weight means bodyweight. The backend rejects an empty body, so callers must
 * include at least one field.
 */
export const updateRoutineExerciseSet = async (
  routineId: string,
  routineExerciseId: string,
  setId: string,
  body: Partial<
    Pick<
      routineExerciseSetSchema.RoutineExerciseSet,
      "type" | "reps" | "weightUnit" | "weight"
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
  const response = await apiClient.patch<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises/${encodeURIComponent(routineExerciseId)}/sets/${encodeURIComponent(setId)}`,
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
