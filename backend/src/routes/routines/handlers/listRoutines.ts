import { Database, routineSchema } from "@overload/database";
import { UnauthorizedError } from "../../../errors/client";
import { listRoutines } from "../../../services/database/queries/routine/listRoutines";

interface ListRoutinesHandlerOptions {
  database: Database;
  userId: string | undefined;
}
export const listRoutinesHandler = async ({
  database,
  userId,
}: ListRoutinesHandlerOptions): Promise<
  Pick<routineSchema.Routine, "id" | "name" | "description">[]
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const routines = await listRoutines(database, userId);

  return routines;
};
