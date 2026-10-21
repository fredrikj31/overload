import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "../../../api/errors";
import { useListRoutineExercises } from "../../../api/queries/routines/listRoutineExercises/useListRoutineExercises";
import { routinesQueryKey } from "../../../api/queries/routines/listRoutines/useListRoutines";
import { QueryErrorState } from "../../../components/QueryErrorState";
import { ExerciseListSkeleton } from "../../_authenticated.exercises/components/ExerciseListSkeleton";
import { RoutineExerciseRow } from "./RoutineExerciseRow";

type RoutineExerciseListProps = {
  routineId: string;
};

export const RoutineExerciseList = ({
  routineId,
}: RoutineExerciseListProps) => {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch } =
    useListRoutineExercises(routineId);

  useEffect(() => {
    if (!isError) return;

    console.error(error);
    toast.error("Could not load exercises", { position: "bottom-right" });

    if (
      error instanceof ApiError &&
      error.status === 404 &&
      error.code === "routine-not-found"
    ) {
      // The routine is gone (deleted elsewhere). Refresh the cached list so
      // the page falls through to its "Routine not found" state.
      void queryClient.invalidateQueries({ queryKey: routinesQueryKey });
    }
  }, [isError, error, queryClient]);

  if (isPending) {
    return <ExerciseListSkeleton />;
  }

  if (isError) {
    return (
      <QueryErrorState message={error.message} onRetry={() => void refetch()} />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
        <p>No exercises yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <ol className="divide-y rounded-xl border">
      {data.map((routineExercise, index) => (
        // Keyed on the slot, not the exercise: the same exercise can appear
        // more than once in a routine.
        <RoutineExerciseRow
          key={routineExercise.id}
          routineExercise={routineExercise}
          number={index + 1}
        />
      ))}
    </ol>
  );
};
