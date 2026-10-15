import { Database } from "@overload/database";
import { UnauthorizedError } from "../../../errors/client";
import { createRoutine } from "../../../services/database/queries/routine/createRoutine";
import { CreateRoutineBody, Routine } from "../../../types/routine";

interface CreateRoutineHandlerOptions {
  database: Database;
  userId: string | undefined;
  body: CreateRoutineBody;
}
export const createRoutineHandler = async ({
  database,
  userId,
  body,
}: CreateRoutineHandlerOptions): Promise<Routine> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const routine = await createRoutine(database, { ...body, userId });

  return routine;
};
