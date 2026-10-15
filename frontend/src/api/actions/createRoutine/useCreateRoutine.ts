import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoutine } from "./createRoutine";

/** Query key a future "list routines" query should use, so creates refresh it. */
export const routinesQueryKey = ["routines"] as const;

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof createRoutine>[0]) => {
      return createRoutine(body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: routinesQueryKey });
    },
  });
};
