import { z } from "zod";
import { apiClient } from "../../client";
import {
  UserPreference,
  UserPreferenceSchema,
} from "../../../types/userPreference";

/**
 * Creates the signed-in user's preferences. Fields left out take the
 * backend defaults. Fails with a 409 if the user already has preferences.
 */
export const createPreferences = async (
  body: Partial<Pick<UserPreference, "weightUnit">>,
): Promise<Pick<UserPreference, "weightUnit">> => {
  const response = await apiClient.post<unknown>("/preferences", body);
  return z
    .object({ data: UserPreferenceSchema.pick({ weightUnit: true }) })
    .parse(response.data).data;
};
