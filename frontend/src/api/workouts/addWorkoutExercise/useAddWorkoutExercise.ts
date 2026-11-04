import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { addWorkoutExercise } from "./addWorkoutExercise";

interface AddWorkoutExerciseVariables {
  workoutId: string;
  exerciseId: string;
}

export const useAddWorkoutExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, exerciseId }: AddWorkoutExerciseVariables) => {
      return addWorkoutExercise(workoutId, { exerciseId });
    },
    onSuccess: (_workoutExercise, { workoutId }) => {
      // The response carries no nested exercise, so refetch the list rather
      // than appending to the cache by hand.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workouts.exercises(workoutId),
      });
    },
  });
};
