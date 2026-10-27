import { Database } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { RoutineExercise } from "../../../../types/routineExercise";

interface GetRoutineExerciseOptions {
  id: string;
  routineId: string;
}

/**
 * Fetches a single exercise slot in a routine. Only matches slots that belong
 * to `routineId` and are not deleted, so together with `getRoutine` (which
 * checks the routine's owner) it doubles as the ownership check for sub-resources
 * of the slot, such as its sets.
 *
 * @returns the routine exercise, or `undefined` if no slot matched.
 */
export const getRoutineExercise = async (
  database: Database,
  { id, routineId }: GetRoutineExerciseOptions,
): Promise<RoutineExercise | undefined> => {
  const row = await database.query.routineExercise
    .findFirst({
      columns: { id: true, routineId: true, exerciseId: true, position: true },
      where: { id, routineId, deletedAt: { isNull: true } },
    })
    .catch((error) => {
      logger.error(error, "Error while getting routine exercise.");
      throw new InternalServerError({
        code: "unknown-error-getting-routine-exercise",
        message: "Unknown error when trying to get routine exercise",
      });
    });

  return row;
};
