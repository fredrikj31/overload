import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { getWorkoutQueryOptions } from "../getWorkout/useGetWorkout";
import { startWorkout } from "./startWorkout";

export const useStartWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startWorkout(),
    onSuccess: (workout) => {
      // Seed the detail query so the workout screen renders straight away
      // after the redirect instead of fetching what we were just given.
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
