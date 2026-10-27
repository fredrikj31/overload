import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { listRoutineExercises } from "./listRoutineExercises";

/**
 * Nested under `routinesQueryKey` so invalidating the routines prefix (e.g.
 * after deleting a routine) also drops its exercises. `useAddRoutineExercise`
 * and `useAddRoutineExerciseSet` invalidate this key after a mutation.
 */
export const routineExercisesQueryKey = (routineId: string) =>
  ["routines", routineId, "exercises"] as const;

export const listRoutineExercisesQueryOptions = (
  routineId: string | undefined,
) =>
  queryOptions({
    // The route param is typed as possibly undefined; skip the request until
    // it is known rather than hitting /routines/undefined/exercises.
    queryKey: routineExercisesQueryKey(routineId ?? ""),
    queryFn:
      routineId === undefined
        ? skipToken
        : () => listRoutineExercises(routineId),
    staleTime: 5 * 60 * 1000,
  });

export const useListRoutineExercises = (routineId: string | undefined) => {
  return useQuery(listRoutineExercisesQueryOptions(routineId));
};
