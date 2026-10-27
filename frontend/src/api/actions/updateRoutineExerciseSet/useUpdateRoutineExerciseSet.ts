import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routineExercisesQueryKey } from "../../queries/routines/listRoutineExercises/useListRoutineExercises";
import { RoutineExerciseListItem } from "../../queries/routines/types";
import { UpdateRoutineExerciseSetBody } from "./types";
import { updateRoutineExerciseSet } from "./updateRoutineExerciseSet";

interface UpdateRoutineExerciseSetVariables {
  routineId: string;
  routineExerciseId: string;
  setId: string;
  body: UpdateRoutineExerciseSetBody;
}

export const useUpdateRoutineExerciseSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      routineExerciseId,
      setId,
      body,
    }: UpdateRoutineExerciseSetVariables) => {
      return updateRoutineExerciseSet(
        routineId,
        routineExerciseId,
        setId,
        body,
      );
    },
    onSuccess: (updated, { routineId, routineExerciseId }) => {
      // Swap the set in the cached list right away so the row shows the new
      // values without a round trip, then refetch to stay in sync.
      queryClient.setQueryData<RoutineExerciseListItem[]>(
        routineExercisesQueryKey(routineId),
        (items) =>
          items?.map((item) =>
            item.id === routineExerciseId
              ? {
                  ...item,
                  sets: item.sets.map((set) =>
                    set.id === updated.id ? updated : set,
                  ),
                }
              : item,
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: routineExercisesQueryKey(routineId),
      });
    },
  });
};
