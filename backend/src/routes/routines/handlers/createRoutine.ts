import { Database, routineSchema } from "@overload/database";
import { UnauthorizedError } from "../../../errors/client";
import { createRoutine } from "../../../services/database/queries/routine/createRoutine";

interface CreateRoutineHandlerOptions {
  database: Database;
  userId: string | undefined;
  body: Pick<routineSchema.Routine, "name"> &
    Partial<Pick<routineSchema.Routine, "description">>;
}
export const createRoutineHandler = async ({
  database,
  userId,
  body,
}: CreateRoutineHandlerOptions): Promise<
  Pick<routineSchema.Routine, "id" | "name" | "description">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const routine = await createRoutine(database, { ...body, userId });

  return routine;
};
