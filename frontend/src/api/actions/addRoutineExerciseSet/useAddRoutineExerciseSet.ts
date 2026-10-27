import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routineExercisesQueryKey } from "../../queries/routines/listRoutineExercises/useListRoutineExercises";
import { RoutineExerciseListItem } from "../../queries/routines/types";
import { addRoutineExerciseSet } from "./addRoutineExerciseSet";
import { AddRoutineExerciseSetBody } from "./types";

interface AddRoutineExerciseSetVariables {
  routineId: string;
  routineExerciseId: string;
  body: AddRoutineExerciseSetBody;
}

export const useAddRoutineExerciseSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      routineExerciseId,
      body,
    }: AddRoutineExerciseSetVariables) => {
      return addRoutineExerciseSet(routineId, routineExerciseId, body);
    },
    onSuccess: (created, { routineId, routineExerciseId }) => {
      // Append the set to its slot in the cached list right away so the new
      // row shows up without a round trip, then refetch to stay in sync.
      queryClient.setQueryData<RoutineExerciseListItem[]>(
        routineExercisesQueryKey(routineId),
        (items) =>
          items?.map((item) =>
            item.id === routineExerciseId
              ? { ...item, sets: [...item.sets, created] }
              : item,
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: routineExercisesQueryKey(routineId),
      });
    },
  });
};
