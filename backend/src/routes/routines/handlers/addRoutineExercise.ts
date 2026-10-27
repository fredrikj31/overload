import { Database, RoutineExercise } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { exerciseExists } from "../../../services/database/queries/exercise/exerciseExists";
import { getRoutine } from "../../../services/database/queries/routine/getRoutine";
import { createRoutineExercise } from "../../../services/database/queries/routineExercise/createRoutineExercise";

interface AddRoutineExerciseHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
  body: Pick<RoutineExercise, "exerciseId">;
}
export const addRoutineExerciseHandler = async ({
  database,
  userId,
  params,
  body,
}: AddRoutineExerciseHandlerOptions): Promise<
  Pick<RoutineExercise, "id" | "routineId" | "exerciseId" | "position">
> => {
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

  const exists = await exerciseExists(database, body.exerciseId);
  if (!exists) {
    throw new NotFoundError({
      code: "exercise-not-found",
      message: "The exercise was not found",
    });
  }

  const routineExercise = await createRoutineExercise(database, {
    routineId: routine.id,
    exerciseId: body.exerciseId,
  });

  return routineExercise;
};
