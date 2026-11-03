import { Database, workoutExercise, WorkoutExercise } from "@overload/database";
import { sql } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface CreateWorkoutExerciseOptions {
  workoutId: string;
  exerciseId: string;
}

/**
 * Appends an exercise to the end of a workout.
 *
 * The position is computed in the insert itself (`max(position) + 1` among
 * the workout's non-deleted slots, or 0 for an empty workout) so there is no
 * read-then-write. Soft-deleted slots are ignored, so their positions can be
 * reused. Two concurrent appends to the same workout may end up with the same
 * position; nothing enforces uniqueness on it, so that is tolerated for now.
 *
 * `routineExerciseId` is left null: this is for exercises added ad hoc during
 * the session, not for slots copied from a routine.
 *
 * Callers are expected to have verified that the workout is owned by the
 * user, is still in progress, and that the exercise exists.
 */
export const createWorkoutExercise = async (
  database: Database,
  { workoutId, exerciseId }: CreateWorkoutExerciseOptions,
): Promise<
  Pick<
    WorkoutExercise,
    "id" | "workoutId" | "exerciseId" | "routineExerciseId" | "position"
  >
> => {
  const nextPosition = sql<number>`coalesce(
    (select max(${workoutExercise.position}) + 1
       from ${workoutExercise}
      where ${workoutExercise.workoutId} = ${workoutId}
        and ${workoutExercise.deletedAt} is null),
    0)`;

  const [row] = await database
    .insert(workoutExercise)
    .values({ workoutId, exerciseId, position: nextPosition })
    .returning({
      id: workoutExercise.id,
      workoutId: workoutExercise.workoutId,
      exerciseId: workoutExercise.exerciseId,
      routineExerciseId: workoutExercise.routineExerciseId,
      position: workoutExercise.position,
    })
    .catch((error) => {
      logger.error(error, "Error while adding exercise to workout.");
      throw new InternalServerError({
        code: "unknown-error-adding-exercise-to-workout",
        message: "Unknown error when trying to add exercise to workout",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while adding exercise to workout.");
    throw new InternalServerError({
      code: "workout-exercise-not-returned-after-insert",
      message: "The workout exercise was not returned after being created",
    });
  }

  return row;
};
