import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { getWorkoutQueryOptions } from "../getWorkout/useGetWorkout";
import { finishWorkout } from "./finishWorkout";

export const useFinishWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: string) => finishWorkout(workoutId),
    onSuccess: (workout) => {
      // Write the finished workout into the detail cache so the status badge
      // and the elapsed time (both driven by `endedAt`) update without a fetch.
      queryClient.setQueryData(
        getWorkoutQueryOptions(workout.id).queryKey,
        workout,
      );
      // Only the list itself (`exact`): a prefix match would also mark the
      // detail we just seeded as stale.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workouts.list,
        exact: true,
      });
    },
  });
};
