import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { deleteRoutine } from "./deleteRoutine";
import { Routine } from "../../../types/routine";

export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteRoutine(id);
    },
    onSuccess: (_, id) => {
      // Drop the routine from the cached list right away so the list page is
      // correct on arrival, then refetch to stay in sync with the server.
      queryClient.setQueryData<Pick<Routine, "id" | "name" | "description">[]>(
        queryKeys.routines.list,
        (routines) => routines?.filter((routine) => routine.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.routines.list });
    },
  });
};
