import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { listWorkoutExercises } from "./listWorkoutExercises";
import { queryKeys } from "../../queryKeys";

export const listWorkoutExercisesQueryOptions = (
  workoutId: string | undefined,
) =>
  queryOptions({
    // The route param is typed as possibly undefined; skip the request until
    // it is known rather than hitting /workouts/undefined/exercises.
    queryKey: queryKeys.workouts.exercises(workoutId ?? ""),
    queryFn:
      workoutId === undefined
        ? skipToken
        : () => listWorkoutExercises(workoutId),
    staleTime: 5 * 60 * 1000,
  });

export const useListWorkoutExercises = (workoutId: string | undefined) => {
  return useQuery(listWorkoutExercisesQueryOptions(workoutId));
};
