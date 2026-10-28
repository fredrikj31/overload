import { Database, UserPreference, userPreference } from "@overload/database";
import { logger } from "../../../../logger";
import { ConflictError } from "../../../../errors/client";
import { InternalServerError } from "../../../../errors/server";
import { isUniqueViolation } from "../../isUniqueViolation";

/**
 * Inserts the user's preferences row. Fields left out take the column
 * defaults. Throws ConflictError when the user already has a row: the insert
 * is allowed to hit the primary key so the check is race-free.
 */
export const createUserPreference = async (
  database: Database,
  values: Pick<UserPreference, "userId"> &
    Partial<Pick<UserPreference, "weightUnit">>,
): Promise<Pick<UserPreference, "weightUnit">> => {
  const [row] = await database
    .insert(userPreference)
    .values(values)
    .returning({ weightUnit: userPreference.weightUnit })
    .catch((error) => {
      if (isUniqueViolation(error)) {
        throw new ConflictError({
          code: "user-preference-already-exists",
          message: "The user already has preferences",
        });
      }

      logger.error(error, "Error while creating user preference.");
      throw new InternalServerError({
        code: "unknown-error-creating-user-preference",
        message: "Unknown error when trying to create user preference",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while creating user preference.");
    throw new InternalServerError({
      code: "user-preference-not-returned-after-insert",
      message: "The user preference was not returned after being created",
    });
  }

  return row;
};
