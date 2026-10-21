import { Database } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getRoutine } from "../../../services/database/queries/routine/getRoutine";
import { listRoutineExercises } from "../../../services/database/queries/routineExercise/listRoutineExercises";
import { RoutineParams } from "../../../types/routine";
import { RoutineExerciseListItem } from "../../../types/routineExercise";

interface ListRoutineExercisesHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: RoutineParams;
}
export const listRoutineExercisesHandler = async ({
  database,
  userId,
  params,
}: ListRoutineExercisesHandlerOptions): Promise<RoutineExerciseListItem[]> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const routine = await getRoutine(database, { id: params.id, userId });

  // A routine owned by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given routine id exists.
  if (!routine) {
    throw new NotFoundError({
      code: "routine-not-found",
      message: "The routine was not found",
    });
  }

  const routineExercises = await listRoutineExercises(database, routine.id);

  return routineExercises;
};
