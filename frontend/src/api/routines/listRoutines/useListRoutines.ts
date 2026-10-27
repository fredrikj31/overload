import { queryOptions, useQuery } from "@tanstack/react-query";
import { listRoutines } from "./listRoutines";
import { queryKeys } from "../../queryKeys";

export const listRoutinesQueryOptions = queryOptions({
  queryKey: queryKeys.routines.list,
  queryFn: listRoutines,
  staleTime: 5 * 60 * 1000,
});

export const useListRoutines = () => {
  return useQuery(listRoutinesQueryOptions);
};

/**
 * There is no detail endpoint yet, so a single routine is looked up in the
 * cached list. Shares the query key with `useListRoutines`.
 */
export const useRoutine = (id: string | undefined) => {
  return useQuery({
    ...listRoutinesQueryOptions,
    select: (routines) => routines.find((routine) => routine.id === id),
  });
};
