import { Database, WorkoutExercise } from "@overload/database";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/client";
import { exerciseExists } from "../../../services/database/queries/exercise/exerciseExists";
import { getWorkout } from "../../../services/database/queries/workout/getWorkout";
import { createWorkoutExercise } from "../../../services/database/queries/workoutExercise/createWorkoutExercise";

interface AddWorkoutExerciseHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
  body: Pick<WorkoutExercise, "exerciseId">;
}

export const addWorkoutExerciseHandler = async ({
  database,
  userId,
  params,
  body,
}: AddWorkoutExerciseHandlerOptions): Promise<
  Pick<
    WorkoutExercise,
    "id" | "workoutId" | "exerciseId" | "routineExerciseId" | "position"
  >
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

  // Exercises can only be added while the workout is in progress. The check
  // and the insert below are separate statements, so a finish racing with an
  // add could slip through; that is tolerated for now.
  if (workout.endedAt !== null) {
    throw new ConflictError({
      code: "workout-already-ended",
      message: "The workout has already ended",
    });
  }

  const exists = await exerciseExists(database, body.exerciseId);
  if (!exists) {
    throw new NotFoundError({
      code: "exercise-not-found",
      message: "The exercise was not found",
    });
  }

  const workoutExercise = await createWorkoutExercise(database, {
    workoutId: workout.id,
    exerciseId: body.exerciseId,
  });

  return workoutExercise;
};
