import { Database, routineExerciseSchema } from "@overload/database";
import { sql } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { RoutineExercise } from "../../../../types/routineExercise";

const { routineExercise } = routineExerciseSchema;

interface CreateRoutineExerciseOptions {
  routineId: string;
  exerciseId: string;
}

/**
 * Appends an exercise to the end of a routine.
 *
 * The position is computed in the insert itself (`max(position) + 1` among
 * the routine's non-deleted slots, or 0 for an empty routine) so there is no
 * read-then-write. Soft-deleted slots are ignored, so their positions can be
 * reused. Two concurrent appends to the same routine may end up with the same
 * position; nothing enforces uniqueness on it, so that is tolerated for now.
 *
 * Callers are expected to have verified that the routine is owned by the
 * user and that the exercise exists.
 */
export const createRoutineExercise = async (
  database: Database,
  { routineId, exerciseId }: CreateRoutineExerciseOptions,
): Promise<RoutineExercise> => {
  const nextPosition = sql<number>`coalesce(
    (select max(${routineExercise.position}) + 1
       from ${routineExercise}
      where ${routineExercise.routineId} = ${routineId}
        and ${routineExercise.deletedAt} is null),
    0)`;

  const [row] = await database
    .insert(routineExercise)
    .values({ routineId, exerciseId, position: nextPosition })
    .returning({
      id: routineExercise.id,
      routineId: routineExercise.routineId,
      exerciseId: routineExercise.exerciseId,
      position: routineExercise.position,
    })
    .catch((error) => {
      logger.error(error, "Error while adding exercise to routine.");
      throw new InternalServerError({
        code: "unknown-error-adding-exercise-to-routine",
        message: "Unknown error when trying to add exercise to routine",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while adding exercise to routine.");
    throw new InternalServerError({
      code: "routine-exercise-not-returned-after-insert",
      message: "The routine exercise was not returned after being created",
    });
  }

  return row;
};
