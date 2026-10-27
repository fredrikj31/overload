import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { listRoutineExercises } from "./listRoutineExercises";
import { queryKeys } from "../../queryKeys";

export const listRoutineExercisesQueryOptions = (
  routineId: string | undefined,
) =>
  queryOptions({
    // The route param is typed as possibly undefined; skip the request until
    // it is known rather than hitting /routines/undefined/exercises.
    queryKey: queryKeys.routines.exercises(routineId ?? ""),
    queryFn:
      routineId === undefined
        ? skipToken
        : () => listRoutineExercises(routineId),
    staleTime: 5 * 60 * 1000,
  });

export const useListRoutineExercises = (routineId: string | undefined) => {
  return useQuery(listRoutineExercisesQueryOptions(routineId));
};
