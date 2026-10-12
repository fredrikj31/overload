import { Database } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { ExerciseListItem } from "../../../../types/exercise";

export const listExercises = async (
  database: Database,
): Promise<ExerciseListItem[]> => {
  const rows = await database.query.exercise
    .findMany({
      columns: {
        id: true,
        name: true,
        instructions: true,
        imagePath: true,
        gifPath: true,
        attribution: true,
      },
      where: { deletedAt: { isNull: true } },
      with: {
        bodyPart: { columns: { id: true, name: true, slug: true } },
        equipment: { columns: { id: true, name: true, slug: true } },
        muscleExercises: {
          columns: { role: true },
          where: { deletedAt: { isNull: true } },
          with: { muscle: { columns: { id: true, name: true, slug: true } } },
        },
      },
      orderBy: { name: "asc" },
    })
    .catch((error) => {
      logger.error(error, "Error while listing exercises.");
      throw new InternalServerError({
        code: "unknown-error-listing-exercises",
        message: "Unknown error when trying to list exercises",
      });
    });

  const mappedRows = rows.map(({ muscleExercises, ...exercise }) => ({
    ...exercise,
    muscles: muscleExercises.map(({ role, muscle }) => ({ ...muscle, role })),
  }));

  return mappedRows;
};
