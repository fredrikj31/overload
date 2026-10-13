import { queryOptions, useQuery } from "@tanstack/react-query";
import { listExercises } from "./listExercises";

export const exercisesQueryKey = ["exercises"] as const;

export const listExercisesQueryOptions = queryOptions({
  queryKey: exercisesQueryKey,
  queryFn: listExercises,
  staleTime: 5 * 60 * 1000,
});

export const useListExercises = () => {
  return useQuery(listExercisesQueryOptions);
};

/**
 * There is no detail endpoint yet, so a single exercise is looked up in the
 * cached list. Shares the query key with `useListExercises`.
 */
export const useExercise = (id: string | undefined) => {
  return useQuery({
    ...listExercisesQueryOptions,
    select: (exercises) => exercises.find((exercise) => exercise.id === id),
  });
};
