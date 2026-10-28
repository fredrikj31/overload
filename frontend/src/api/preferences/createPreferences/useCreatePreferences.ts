import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { createPreferences } from "./createPreferences";

export const useCreatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof createPreferences>[0]) => {
      return createPreferences(body);
    },
    onSuccess: (data) => {
      // Seed the cache instead of invalidating so the onboarding gate in
      // `AuthenticatedRouteLayout` sees the row the moment we navigate to "/".
      queryClient.setQueryData(queryKeys.preferences.detail, data);
    },
  });
};
