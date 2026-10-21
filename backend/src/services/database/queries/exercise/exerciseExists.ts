import { Database } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/**
 * Checks that an exercise exists and is not deleted.
 *
 * Used before inserting rows that reference an exercise: a foreign key
 * violation would surface as a 500, and the foreign key can't see soft
 * deletes anyway.
 */
export const exerciseExists = async (
  database: Database,
  id: string,
): Promise<boolean> => {
  const row = await database.query.exercise
    .findFirst({
      columns: { id: true },
      where: { id, deletedAt: { isNull: true } },
    })
    .catch((error) => {
      logger.error(error, "Error while checking exercise exists.");
      throw new InternalServerError({
        code: "unknown-error-checking-exercise",
        message: "Unknown error when trying to check exercise",
      });
    });

  return row !== undefined;
};
