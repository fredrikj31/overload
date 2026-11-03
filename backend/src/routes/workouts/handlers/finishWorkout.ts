import { Database, Workout } from "@overload/database";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/client";
import { finishWorkout } from "../../../services/database/queries/workout/finishWorkout";
import { getWorkout } from "../../../services/database/queries/workout/getWorkout";

interface FinishWorkoutHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
}

export const finishWorkoutHandler = async ({
  database,
  userId,
  params,
}: FinishWorkoutHandlerOptions): Promise<
  Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const finished = await finishWorkout(database, { id: params.id, userId });
  if (finished) {
    return finished;
  }

  // The update matched nothing: either the workout doesn't exist for this
  // user, or it exists but has already ended. Look it up to tell the two apart.
  const existing = await getWorkout(database, { id: params.id, userId });
  if (existing) {
    throw new ConflictError({
      code: "workout-already-ended",
      message: "The workout has already ended",
    });
  }

  // A workout owned by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given workout id exists.
  throw new NotFoundError({
    code: "workout-not-found",
    message: "The workout was not found",
  });
};
