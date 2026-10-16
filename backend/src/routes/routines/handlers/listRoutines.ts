import { Database } from "@overload/database";
import { UnauthorizedError } from "../../../errors/client";
import { listRoutines } from "../../../services/database/queries/routine/listRoutines";
import { Routine } from "../../../types/routine";

interface ListRoutinesHandlerOptions {
  database: Database;
  userId: string | undefined;
}
export const listRoutinesHandler = async ({
  database,
  userId,
}: ListRoutinesHandlerOptions): Promise<Routine[]> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const routines = await listRoutines(database, userId);

  return routines;
};
