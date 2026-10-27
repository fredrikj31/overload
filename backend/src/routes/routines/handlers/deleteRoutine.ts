import { Database } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { deleteRoutine } from "../../../services/database/queries/routine/deleteRoutine";

interface DeleteRoutineHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
}
export const deleteRoutineHandler = async ({
  database,
  userId,
  params,
}: DeleteRoutineHandlerOptions): Promise<void> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const deleted = await deleteRoutine(database, { id: params.id, userId });

  // A routine owned by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given routine id exists.
  if (!deleted) {
    throw new NotFoundError({
      code: "routine-not-found",
      message: "The routine was not found",
    });
  }
};
