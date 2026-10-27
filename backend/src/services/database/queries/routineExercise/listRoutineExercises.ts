import { Database } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { RoutineExerciseListItem } from "../../../../types/routineExercise";

/**
 * Lists a routine's non-deleted exercise slots in routine order, each with
 * the exercise it points at and its non-deleted planned sets in set order.
 *
 * A soft-deleted library exercise is still returned: it stays part of the
 * routine (the FK is `restrict`), and hiding it would silently shift the
 * slots the user sees.
 *
 * Callers are expected to have verified that the routine is owned by the
 * user.
 */
export const listRoutineExercises = async (
  database: Database,
  routineId: string,
): Promise<RoutineExerciseListItem[]> => {
  const rows = await database.query.routineExercise
    .findMany({
      columns: { id: true, routineId: true, exerciseId: true, position: true },
      where: { routineId, deletedAt: { isNull: true } },
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
        routineExerciseSets: {
          columns: {
            id: true,
            routineExerciseId: true,
            position: true,
            type: true,
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
      logger.error(error, "Error while listing routine exercises.");
      throw new InternalServerError({
        code: "unknown-error-listing-routine-exercises",
        message: "Unknown error when trying to list routine exercises",
      });
    });

  // The relation is named after the table; the API exposes it as `sets`.
  return rows.map(({ routineExerciseSets, ...rest }) => ({
    ...rest,
    sets: routineExerciseSets,
  }));
};
