import { Database, UserPreference } from "@overload/database";
import { UnauthorizedError } from "../../../errors/client";
import { createUserPreference } from "../../../services/database/queries/userPreference/createUserPreference";

interface CreatePreferenceHandlerOptions {
  database: Database;
  userId: string | undefined;
  body: Partial<Pick<UserPreference, "weightUnit">>;
}

export const createPreferenceHandler = async ({
  database,
  userId,
  body,
}: CreatePreferenceHandlerOptions): Promise<
  Pick<UserPreference, "weightUnit">
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const preference = await createUserPreference(database, {
    ...body,
    userId,
  });

  return preference;
};
