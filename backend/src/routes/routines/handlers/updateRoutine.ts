import { Database, routineSchema } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { updateRoutine } from "../../../services/database/queries/routine/updateRoutine";

interface UpdateRoutineHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
  body: Partial<Pick<routineSchema.Routine, "name" | "description">>;
}
export const updateRoutineHandler = async ({
  database,
  userId,
  params,
  body,
}: UpdateRoutineHandlerOptions): Promise<
  Pick<routineSchema.Routine, "id" | "name" | "description">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const routine = await updateRoutine(database, {
    id: params.id,
    userId,
    values: body,
  });

  // A routine owned by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given routine id exists.
  if (!routine) {
    throw new NotFoundError({
      code: "routine-not-found",
      message: "The routine was not found",
    });
  }

  return routine;
};
