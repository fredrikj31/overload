import { Database, Workout } from "@overload/database";
import { ConflictError, UnauthorizedError } from "../../../errors/client";
import { createWorkout } from "../../../services/database/queries/workout/createWorkout";
import { getInProgressWorkout } from "../../../services/database/queries/workout/getInProgressWorkout";

// `workout.name` is required and an empty workout has no routine to take a
// name from. A future rename endpoint is the way to change it.
const EMPTY_WORKOUT_NAME = "Workout";

interface StartWorkoutHandlerOptions {
  database: Database;
  userId: string | undefined;
}

/**
 * Starts an empty workout: a workout row with no exercises or sets, not
 * linked to any routine. Refuses with 409 while the user already has a
 * workout in progress so the client only ever has one active session.
 *
 * The check and the insert are two statements, so two simultaneous starts
 * can both succeed. Nothing enforces the one-active-workout rule in the
 * database; that is tolerated for now.
 */
export const startWorkoutHandler = async ({
  database,
  userId,
}: StartWorkoutHandlerOptions): Promise<
  Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const inProgress = await getInProgressWorkout(database, { userId });
  if (inProgress) {
    throw new ConflictError({
      code: "workout-already-in-progress",
      message: "A workout is already in progress",
    });
  }

  const workout = await createWorkout(database, {
    userId,
    name: EMPTY_WORKOUT_NAME,
  });

  return workout;
};
