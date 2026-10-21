import { Database } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { Routine } from "../../../../types/routine";

interface GetRoutineOptions {
  id: string;
  userId: string;
}

/**
 * Fetches a single routine. Only matches routines owned by `userId` that are
 * not deleted, so it doubles as the ownership check for routine sub-resources.
 *
 * @returns the routine, or `undefined` if no routine matched.
 */
export const getRoutine = async (
  database: Database,
  { id, userId }: GetRoutineOptions,
): Promise<Routine | undefined> => {
  const row = await database.query.routine
    .findFirst({
      columns: { id: true, name: true, description: true },
      where: { id, userId, deletedAt: { isNull: true } },
    })
    .catch((error) => {
      logger.error(error, "Error while getting routine.");
      throw new InternalServerError({
        code: "unknown-error-getting-routine",
        message: "Unknown error when trying to get routine",
      });
    });

  return row;
};
