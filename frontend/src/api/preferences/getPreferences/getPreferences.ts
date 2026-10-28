import { z } from "zod";
import { apiClient } from "../../client";
import {
  UserPreference,
  UserPreferenceSchema,
} from "../../../types/userPreference";

/** Fails with a 404 `user-preference-not-found` until the user has onboarded. */
export const getPreferences = async (): Promise<
  Pick<UserPreference, "weightUnit">
> => {
  const response = await apiClient.get<unknown>("/preferences");
  return z
    .object({ data: UserPreferenceSchema.pick({ weightUnit: true }) })
    .parse(response.data).data;
};
