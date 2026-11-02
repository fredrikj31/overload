import { Database, Workout } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface GetWorkoutOptions {
  id: string;
  userId: string;
}

/**
 * Fetches a single workout. Only matches workouts owned by `userId` that are
 * not deleted, so it doubles as the ownership check for workout sub-resources.
 *
 * @returns the workout, or `undefined` if no workout matched.
 */
export const getWorkout = async (
  database: Database,
  { id, userId }: GetWorkoutOptions,
): Promise<
  | Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
  | undefined
> => {
  const row = await database.query.workout
    .findFirst({
      columns: {
        id: true,
        routineId: true,
        name: true,
        startedAt: true,
        endedAt: true,
      },
      where: { id, userId, deletedAt: { isNull: true } },
    })
    .catch((error) => {
      logger.error(error, "Error while getting workout.");
      throw new InternalServerError({
        code: "unknown-error-getting-workout",
        message: "Unknown error when trying to get workout",
      });
    });

  return row;
};
