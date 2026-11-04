import {
  BodyPart,
  Database,
  Equipment,
  Exercise,
  WorkoutExercise,
  WorkoutExerciseSet,
} from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getWorkout } from "../../../services/database/queries/workout/getWorkout";
import { listWorkoutExercises } from "../../../services/database/queries/workoutExercise/listWorkoutExercises";

interface ListWorkoutExercisesHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
}

export const listWorkoutExercisesHandler = async ({
  database,
  userId,
  params,
}: ListWorkoutExercisesHandlerOptions): Promise<
  (Pick<
    WorkoutExercise,
    "id" | "workoutId" | "exerciseId" | "routineExerciseId" | "position"
  > & {
    exercise: Pick<Exercise, "id" | "name" | "imagePath"> & {
      bodyPart: Pick<BodyPart, "id" | "name" | "slug"> | null;
      equipment: Pick<Equipment, "id" | "name" | "slug">;
    };
    sets: Pick<
      WorkoutExerciseSet,
      | "id"
      | "workoutExerciseId"
      | "position"
      | "type"
      | "completedAt"
      | "reps"
      | "weightUnit"
      | "weight"
    >[];
  })[]
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

  // Finished workouts are listable too: the history outlives the session.
  const workoutExercises = await listWorkoutExercises(database, workout.id);

  return workoutExercises;
};
