import { Database, Workout } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface GetInProgressWorkoutOptions {
  userId: string;
}

/**
 * Fetches the user's in-progress workout: a non-deleted workout whose
 * `endedAt` is still null. The API allows at most one of these per user, so
 * `findFirst` is enough.
 *
 * @returns the workout, or `undefined` if none is in progress.
 */
export const getInProgressWorkout = async (
  database: Database,
  { userId }: GetInProgressWorkoutOptions,
): Promise<Pick<Workout, "id"> | undefined> => {
  const row = await database.query.workout
    .findFirst({
      columns: { id: true },
      where: {
        userId,
        endedAt: { isNull: true },
        deletedAt: { isNull: true },
      },
    })
    .catch((error) => {
      logger.error(error, "Error while getting in-progress workout.");
      throw new InternalServerError({
        code: "unknown-error-getting-in-progress-workout",
        message: "Unknown error when trying to get in-progress workout",
      });
    });

  return row;
};
