import { Database, UserPreference } from "@overload/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface GetUserPreferenceOptions {
  userId: string;
}

/**
 * Fetches the user's preferences row.
 *
 * @returns the preferences, or `undefined` if the user has no row yet.
 */
export const getUserPreference = async (
  database: Database,
  { userId }: GetUserPreferenceOptions,
): Promise<Pick<UserPreference, "weightUnit"> | undefined> => {
  const row = await database.query.userPreference
    .findFirst({
      columns: { weightUnit: true },
      where: { userId },
    })
    .catch((error) => {
      logger.error(error, "Error while getting user preference.");
      throw new InternalServerError({
        code: "unknown-error-getting-user-preference",
        message: "Unknown error when trying to get user preference",
      });
    });

  return row;
};
