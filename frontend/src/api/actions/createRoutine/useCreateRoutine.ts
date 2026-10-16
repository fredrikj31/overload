import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routinesQueryKey } from "../../queries/routines/listRoutines/useListRoutines";
import { createRoutine } from "./createRoutine";

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
