import {
  Database,
  RoutineExerciseSet,
  routineExerciseSet,
} from "@overload/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface UpdateRoutineExerciseSetOptions {
  id: string;
  routineExerciseId: string;
  values: Partial<
    Pick<RoutineExerciseSet, "type" | "reps" | "weightUnit" | "weight">
  >;
}

/**
 * Updates a set's editable fields. Only matches non-deleted sets that belong
 * to `routineExerciseId`, so together with `getRoutine` and
 * `getRoutineExercise` (which check the owner and the slot) it completes the
 * ownership check. `updatedAt` is bumped by the column's `$onUpdate` hook.
 *
 * @returns the updated set, or `undefined` if no set matched.
 */
export const updateRoutineExerciseSet = async (
  database: Database,
  { id, routineExerciseId, values }: UpdateRoutineExerciseSetOptions,
): Promise<
  | Pick<
      RoutineExerciseSet,
      | "id"
      | "routineExerciseId"
      | "position"
      | "type"
      | "reps"
      | "weightUnit"
      | "weight"
    >
  | undefined
> => {
  const [row] = await database
    .update(routineExerciseSet)
    .set(values)
    .where(
      and(
        eq(routineExerciseSet.id, id),
        eq(routineExerciseSet.routineExerciseId, routineExerciseId),
        isNull(routineExerciseSet.deletedAt),
      ),
    )
    .returning({
      id: routineExerciseSet.id,
      routineExerciseId: routineExerciseSet.routineExerciseId,
      position: routineExerciseSet.position,
      type: routineExerciseSet.type,
      reps: routineExerciseSet.reps,
      weightUnit: routineExerciseSet.weightUnit,
      weight: routineExerciseSet.weight,
    })
    .catch((error) => {
      logger.error(error, "Error while updating routine exercise set.");
      throw new InternalServerError({
        code: "unknown-error-updating-routine-exercise-set",
        message: "Unknown error when trying to update routine exercise set",
      });
    });

  return row;
};
