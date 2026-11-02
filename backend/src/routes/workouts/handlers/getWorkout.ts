import { Database, Workout } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getWorkout } from "../../../services/database/queries/workout/getWorkout";

interface GetWorkoutHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
}

export const getWorkoutHandler = async ({
  database,
  userId,
  params,
}: GetWorkoutHandlerOptions): Promise<
  Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const workout = await getWorkout(database, { id: params.id, userId });

  // A workout owned by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given workout id exists.
  if (!workout) {
    throw new NotFoundError({
      code: "workout-not-found",
      message: "The workout was not found",
    });
  }

  return workout;
};
