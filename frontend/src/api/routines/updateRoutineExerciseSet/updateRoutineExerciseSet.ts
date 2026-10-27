import { z } from "zod";
import { apiClient } from "../../client";
import {
  RoutineExerciseSet,
  RoutineExerciseSetSchema,
} from "../../../types/routineExerciseSet";

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
    Pick<RoutineExerciseSet, "type" | "reps" | "weightUnit" | "weight">
  >,
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
  const response = await apiClient.patch<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises/${encodeURIComponent(routineExerciseId)}/sets/${encodeURIComponent(setId)}`,
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
