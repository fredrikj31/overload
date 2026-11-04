import {
  BodyPart,
  Database,
  Equipment,
  Exercise,
  WorkoutExercise,
  WorkoutExerciseSet,
} from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/**
 * Lists a workout's non-deleted exercise slots in workout order, each with
 * the exercise it points at and its non-deleted logged sets in set order.
 *
 * A soft-deleted library exercise is still returned: it stays part of the
 * workout (the FK is `restrict`), and hiding it would silently shift the
 * slots the user sees.
 *
 * Callers are expected to have verified that the workout is owned by the
 * user.
 */
export const listWorkoutExercises = async (
  database: Database,
  workoutId: string,
): Promise<
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
  const rows = await database.query.workoutExercise
    .findMany({
      columns: {
        id: true,
        workoutId: true,
        exerciseId: true,
        routineExerciseId: true,
        position: true,
      },
      where: { workoutId, deletedAt: { isNull: true } },
      // Concurrent appends may share a position; createdAt breaks the tie so
      // the order is stable between requests.
      orderBy: { position: "asc", createdAt: "asc" },
      with: {
        exercise: {
          columns: { id: true, name: true, imagePath: true },
          with: {
            bodyPart: { columns: { id: true, name: true, slug: true } },
            equipment: { columns: { id: true, name: true, slug: true } },
          },
        },
        workoutExerciseSets: {
          columns: {
            id: true,
            workoutExerciseId: true,
            position: true,
            type: true,
            completedAt: true,
            reps: true,
            weightUnit: true,
            weight: true,
          },
          where: { deletedAt: { isNull: true } },
          orderBy: { position: "asc", createdAt: "asc" },
        },
      },
    })
    .catch((error) => {
      logger.error(error, "Error while listing workout exercises.");
      throw new InternalServerError({
        code: "unknown-error-listing-workout-exercises",
        message: "Unknown error when trying to list workout exercises",
      });
    });

  // The relation is named after the table; the API exposes it as `sets`.
  return rows.map(({ workoutExerciseSets, ...rest }) => ({
    ...rest,
    sets: workoutExerciseSets,
  }));
};
