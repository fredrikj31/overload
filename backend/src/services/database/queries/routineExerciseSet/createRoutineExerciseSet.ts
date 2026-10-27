import { Database, routineExerciseSetSchema } from "@overload/database";
import { sql } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { RoutineExerciseSet } from "../../../../types/routineExerciseSet";

const { routineExerciseSet } = routineExerciseSetSchema;

interface CreateRoutineExerciseSetOptions {
  routineExerciseId: string;
  type?: routineExerciseSetSchema.SetType;
  reps: number;
  weightUnit: routineExerciseSetSchema.WeightUnit;
  weight?: number | null;
}

/**
 * Appends a planned set to the end of an exercise slot in a routine.
 *
 * The position is computed in the insert itself (`max(position) + 1` among
 * the slot's non-deleted sets, or 0 for a slot without sets) so there is no
 * read-then-write. Soft-deleted sets are ignored, so their positions can be
 * reused. Two concurrent appends to the same slot may end up with the same
 * position; nothing enforces uniqueness on it, so that is tolerated for now.
 *
 * Callers are expected to have verified that the slot belongs to a routine
 * owned by the user, and to have resolved `weightUnit` (it has no database
 * default).
 */
export const createRoutineExerciseSet = async (
  database: Database,
  {
    routineExerciseId,
    type,
    reps,
    weightUnit,
    weight,
  }: CreateRoutineExerciseSetOptions,
): Promise<RoutineExerciseSet> => {
  const nextPosition = sql<number>`coalesce(
    (select max(${routineExerciseSet.position}) + 1
       from ${routineExerciseSet}
      where ${routineExerciseSet.routineExerciseId} = ${routineExerciseId}
        and ${routineExerciseSet.deletedAt} is null),
    0)`;

  const [row] = await database
    .insert(routineExerciseSet)
    .values({
      routineExerciseId,
      position: nextPosition,
      type,
      reps,
      weightUnit,
      weight,
    })
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
      logger.error(error, "Error while adding set to routine exercise.");
      throw new InternalServerError({
        code: "unknown-error-adding-set-to-routine-exercise",
        message: "Unknown error when trying to add set to routine exercise",
      });
    });

  if (!row) {
    logger.error(
      "Insert returned no row while adding set to routine exercise.",
    );
    throw new InternalServerError({
      code: "routine-exercise-set-not-returned-after-insert",
      message: "The routine exercise set was not returned after being created",
    });
  }

  return row;
};
