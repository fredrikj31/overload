import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routinesQueryKey } from "../../queries/routines/listRoutines/useListRoutines";
import { Routine } from "../../queries/routines/types";
import { UpdateRoutineBody } from "./types";
import { updateRoutine } from "./updateRoutine";

interface UpdateRoutineVariables {
  id: string;
  body: UpdateRoutineBody;
}

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateRoutineVariables) => {
      return updateRoutine(id, body);
    },
    onSuccess: (updated) => {
      // Swap the routine in the cached list right away so the detail page
      // (which selects from this list) and the list page show the new values
      // without a round trip, then refetch to stay in sync with the server.
      queryClient.setQueryData<Routine[]>(routinesQueryKey, (routines) =>
        routines?.map((routine) =>
          routine.id === updated.id ? updated : routine,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: routinesQueryKey });
    },
  });
};
