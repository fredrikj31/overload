import { Database, Workout, workout } from "@overload/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface FinishWorkoutOptions {
  id: string;
  userId: string;
}

/**
 * Finishes a workout by setting `endedAt` to now. Only matches workouts owned
 * by `userId` that are not deleted and still in progress (`endedAt` is null),
 * so the update is atomic: two concurrent finish requests cannot both succeed
 * and an existing `endedAt` is never overwritten. `updatedAt` is bumped by
 * `$onUpdate`.
 *
 * @returns the finished workout, or `undefined` if no workout matched (not
 * found, not owned by the user, deleted, or already ended).
 */
export const finishWorkout = async (
  database: Database,
  { id, userId }: FinishWorkoutOptions,
): Promise<
  | Pick<Workout, "id" | "routineId" | "name" | "startedAt" | "endedAt">
  | undefined
> => {
  const [row] = await database
    .update(workout)
    .set({ endedAt: new Date() })
    .where(
      and(
        eq(workout.id, id),
        eq(workout.userId, userId),
        isNull(workout.deletedAt),
        isNull(workout.endedAt),
      ),
    )
    .returning({
      id: workout.id,
      routineId: workout.routineId,
      name: workout.name,
      startedAt: workout.startedAt,
      endedAt: workout.endedAt,
    })
    .catch((error) => {
      logger.error(error, "Error while finishing workout.");
      throw new InternalServerError({
        code: "unknown-error-finishing-workout",
        message: "Unknown error when trying to finish workout",
      });
    });

  return row;
};
