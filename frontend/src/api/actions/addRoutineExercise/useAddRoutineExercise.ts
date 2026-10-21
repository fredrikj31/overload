import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routineExercisesQueryKey } from "../../queries/routines/listRoutineExercises/useListRoutineExercises";
import { addRoutineExercise } from "./addRoutineExercise";

interface AddRoutineExerciseVariables {
  routineId: string;
  exerciseId: string;
}

export const useAddRoutineExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routineId, exerciseId }: AddRoutineExerciseVariables) => {
      return addRoutineExercise(routineId, { exerciseId });
    },
    onSuccess: (_routineExercise, { routineId }) => {
      // The response carries no nested exercise, so refetch the list rather
      // than appending to the cache by hand.
      void queryClient.invalidateQueries({
        queryKey: routineExercisesQueryKey(routineId),
      });
    },
  });
};
