import { Database, routineSchema } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { Routine } from "../../../../types/routine";

const { routine } = routineSchema;

export const createRoutine = async (
  database: Database,
  values: routineSchema.CreateRoutine,
): Promise<Routine> => {
  const [row] = await database
    .insert(routine)
    .values(values)
    .returning({
      id: routine.id,
      name: routine.name,
      description: routine.description,
    })
    .catch((error) => {
      logger.error(error, "Error while creating routine.");
      throw new InternalServerError({
        code: "unknown-error-creating-routine",
        message: "Unknown error when trying to create routine",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while creating routine.");
    throw new InternalServerError({
      code: "routine-not-returned-after-insert",
      message: "The routine was not returned after being created",
    });
  }

  return row;
};
