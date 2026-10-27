import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import * as routineSchema from "../../../types/routine";
import { updateRoutine } from "./updateRoutine";

interface UpdateRoutineVariables {
  id: string;
  body: Partial<Pick<routineSchema.Routine, "name" | "description">>;
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
      queryClient.setQueryData<
        Pick<routineSchema.Routine, "id" | "name" | "description">[]
      >(queryKeys.routines.list, (routines) =>
        routines?.map((routine) =>
          routine.id === updated.id ? updated : routine,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.routines.list });
    },
  });
};
