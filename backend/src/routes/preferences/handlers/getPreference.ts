import { Database, UserPreference } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getUserPreference } from "../../../services/database/queries/userPreference/getUserPreference";

interface GetPreferenceHandlerOptions {
  database: Database;
  userId: string | undefined;
}

export const getPreferenceHandler = async ({
  database,
  userId,
}: GetPreferenceHandlerOptions): Promise<
  Pick<UserPreference, "weightUnit">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const preference = await getUserPreference(database, { userId });

  // Preferences are created explicitly (POST), so no defaults are
  // synthesised here: the client learns it must create them first.
  if (!preference) {
    throw new NotFoundError({
      code: "user-preference-not-found",
      message: "The user has no preferences yet",
    });
  }

  return preference;
};
