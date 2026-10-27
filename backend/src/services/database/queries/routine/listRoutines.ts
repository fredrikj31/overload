import { Database, Routine } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

export const listRoutines = async (
  database: Database,
  userId: string,
): Promise<Pick<Routine, "id" | "name" | "description">[]> => {
  const rows = await database.query.routine
    .findMany({
      columns: { id: true, name: true, description: true },
      where: { userId, deletedAt: { isNull: true } },
      orderBy: { name: "asc" },
    })
    .catch((error) => {
      logger.error(error, "Error while listing routines.");
      throw new InternalServerError({
        code: "unknown-error-listing-routines",
        message: "Unknown error when trying to list routines",
      });
    });

  return rows;
};
