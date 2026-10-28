import { queryOptions, useQuery } from "@tanstack/react-query";
import { ApiError } from "../../errors";
import { queryKeys } from "../../queryKeys";
import { getPreferences } from "./getPreferences";

/** True when the user has not created their preferences yet. */
export const isPreferencesNotFound = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.status === 404 &&
  error.code === "user-preference-not-found";

export const getPreferencesQueryOptions = queryOptions({
  queryKey: queryKeys.preferences.detail,
  queryFn: getPreferences,
  staleTime: 5 * 60 * 1000,
  // "Not found" is the expected answer for a user who hasn't onboarded, so
  // don't sit through the default retry backoff before redirecting them.
  retry: (failureCount, error) =>
    !isPreferencesNotFound(error) && failureCount < 3,
  // The layout gate and the onboarding page share this query; once it has
  // answered "not found" the page mounting right after shouldn't ask again.
  retryOnMount: false,
});

interface UseGetPreferencesOptions {
  enabled?: boolean;
}

export const useGetPreferences = (options?: UseGetPreferencesOptions) => {
  return useQuery({
    ...getPreferencesQueryOptions,
    enabled: options?.enabled ?? true,
  });
};
