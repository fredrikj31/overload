import { Database, UserPreference } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { updateUserPreference } from "../../../services/database/queries/userPreference/updateUserPreference";

interface UpdatePreferenceHandlerOptions {
  database: Database;
  userId: string | undefined;
  body: Partial<Pick<UserPreference, "weightUnit">>;
}

export const updatePreferenceHandler = async ({
  database,
  userId,
  body,
}: UpdatePreferenceHandlerOptions): Promise<
  Pick<UserPreference, "weightUnit">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const preference = await updateUserPreference(database, {
    userId,
    values: body,
  });

  // Preferences are created explicitly (POST), so a missing row is a client
  // ordering mistake rather than something to silently create here.
  if (!preference) {
    throw new NotFoundError({
      code: "user-preference-not-found",
      message: "The user has no preferences yet",
    });
  }

  return preference;
};
