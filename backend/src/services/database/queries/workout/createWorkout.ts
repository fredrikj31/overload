import { Database, Workout, workout } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/**
 * Inserts a workout row. `startedAt` takes its `now()` default and
 * `endedAt` stays null, so the returned workout is in progress. Nothing is
 * inserted into `workout_exercise`; callers that start from a routine copy
 * the exercises themselves.
 */
export const createWorkout = async (
  database: Database,
  values: Pick<Workout, "userId" | "name"> &
    Partial<Pick<Workout, "routineId">>,
): Promise<
  Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
> => {
  const [row] = await database
    .insert(workout)
    .values(values)
    .returning({
      id: workout.id,
      routineId: workout.routineId,
      name: workout.name,
      startedAt: workout.startedAt,
      endedAt: workout.endedAt,
    })
    .catch((error) => {
      logger.error(error, "Error while creating workout.");
      throw new InternalServerError({
        code: "unknown-error-creating-workout",
        message: "Unknown error when trying to create workout",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while creating workout.");
    throw new InternalServerError({
      code: "workout-not-returned-after-insert",
      message: "The workout was not returned after being created",
    });
  }

  return row;
};
