import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { getWorkout } from "./getWorkout";
import { queryKeys } from "../../queryKeys";

export const getWorkoutQueryOptions = (workoutId: string | undefined) =>
  queryOptions({
    // The route param is typed as possibly undefined; skip the request until
    // it is known rather than hitting /workouts/undefined.
    queryKey: queryKeys.workouts.detail(workoutId ?? ""),
    queryFn: workoutId === undefined ? skipToken : () => getWorkout(workoutId),
    staleTime: 5 * 60 * 1000,
  });

export const useGetWorkout = (workoutId: string | undefined) => {
  return useQuery(getWorkoutQueryOptions(workoutId));
};
