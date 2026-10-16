import { Database, routineSchema } from "@overload/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

const { routine } = routineSchema;

interface DeleteRoutineOptions {
  id: string;
  userId: string;
}

/**
 * Soft-deletes a routine by setting `deletedAt`. Only matches routines owned
 * by `userId` that are not already deleted.
 *
 * @returns `true` if a routine was deleted, `false` if no routine matched.
 */
export const deleteRoutine = async (
  database: Database,
  { id, userId }: DeleteRoutineOptions,
): Promise<boolean> => {
  const rows = await database
    .update(routine)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(routine.id, id),
        eq(routine.userId, userId),
        isNull(routine.deletedAt),
      ),
    )
    .returning({ id: routine.id })
    .catch((error) => {
      logger.error(error, "Error while deleting routine.");
      throw new InternalServerError({
        code: "unknown-error-deleting-routine",
        message: "Unknown error when trying to delete routine",
      });
    });

  return rows.length > 0;
};
