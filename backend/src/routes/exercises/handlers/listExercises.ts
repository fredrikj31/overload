import { Database } from "@overload/database";
import { UnauthorizedError } from "../../../errors/client";
import { listExercises } from "../../../services/database/queries/exercise/listExercises";
import { ExerciseListItem } from "../../../types/exercise";

interface ListExercisesHandlerOptions {
  database: Database;
  userId: string | undefined;
}
export const listExercisesHandler = async ({
  database,
  userId,
}: ListExercisesHandlerOptions): Promise<ExerciseListItem[]> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const exercises = await listExercises(database);

  return exercises;
};
