import { Database, UserPreference, userPreference } from "@overload/database";
import { eq } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface UpdateUserPreferenceOptions {
  userId: string;
  values: Partial<Pick<UserPreference, "weightUnit">>;
}

/**
 * Updates the given fields of the user's preferences row. `updatedAt` is
 * bumped by the column's `$onUpdate` hook.
 *
 * @returns the updated preferences, or `undefined` if the user has no row.
 */
export const updateUserPreference = async (
  database: Database,
  { userId, values }: UpdateUserPreferenceOptions,
): Promise<Pick<UserPreference, "weightUnit"> | undefined> => {
  const [row] = await database
    .update(userPreference)
    .set(values)
    .where(eq(userPreference.userId, userId))
    .returning({ weightUnit: userPreference.weightUnit })
    .catch((error) => {
      logger.error(error, "Error while updating user preference.");
      throw new InternalServerError({
        code: "unknown-error-updating-user-preference",
        message: "Unknown error when trying to update user preference",
      });
    });

  return row;
};
