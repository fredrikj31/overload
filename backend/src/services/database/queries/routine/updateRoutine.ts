import { Database, routineSchema } from "@overload/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

const { routine } = routineSchema;

interface UpdateRoutineOptions {
  id: string;
  userId: string;
  values: Partial<Pick<routineSchema.Routine, "name" | "description">>;
}

/**
 * Updates a routine's editable fields. Only matches routines owned by
 * `userId` that are not deleted. `updatedAt` is bumped by the column's
 * `$onUpdate` hook.
 *
 * @returns the updated routine, or `undefined` if no routine matched.
 */
export const updateRoutine = async (
  database: Database,
  { id, userId, values }: UpdateRoutineOptions,
): Promise<
  Pick<routineSchema.Routine, "id" | "name" | "description"> | undefined
> => {
  const [row] = await database
    .update(routine)
    .set(values)
    .where(
      and(
        eq(routine.id, id),
        eq(routine.userId, userId),
        isNull(routine.deletedAt),
      ),
    )
    .returning({
      id: routine.id,
      name: routine.name,
      description: routine.description,
    })
    .catch((error) => {
      logger.error(error, "Error while updating routine.");
      throw new InternalServerError({
        code: "unknown-error-updating-routine",
        message: "Unknown error when trying to update routine",
      });
    });

  return row;
};
