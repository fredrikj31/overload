import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "../../../api/errors";
import { getWorkoutQueryOptions } from "../../../api/workouts/getWorkout/useGetWorkout";
import { useListWorkoutExercises } from "../../../api/workouts/listWorkoutExercises/useListWorkoutExercises";
import { QueryErrorState } from "../../../components/QueryErrorState";
import { ExerciseListSkeleton } from "../../_authenticated.exercises/components/ExerciseListSkeleton";
import { WorkoutExerciseRow } from "./WorkoutExerciseRow";

type WorkoutExerciseListProps = {
  workoutId: string;
  /** Whether the workout has ended; changes the empty-state copy. */
  ended: boolean;
};

export const WorkoutExerciseList = ({
  workoutId,
  ended,
}: WorkoutExerciseListProps) => {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch } =
    useListWorkoutExercises(workoutId);

  useEffect(() => {
    if (!isError) return;

    console.error(error);
    toast.error("Could not load exercises", { position: "bottom-right" });

    if (
      error instanceof ApiError &&
      error.status === 404 &&
      error.code === "workout-not-found"
    ) {
      // The workout is gone (deleted elsewhere). Refresh the cached detail
      // so the page falls through to its "Workout not found" state.
      void queryClient.invalidateQueries({
        queryKey: getWorkoutQueryOptions(workoutId).queryKey,
      });
    }
  }, [isError, error, queryClient, workoutId]);

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
        <p>
          {ended
            ? "No exercises were logged."
            : "No exercises yet. Add one to get started."}
        </p>
      </div>
    );
  }

  return (
    <ol className="divide-y rounded-xl border">
      {data.map((workoutExercise, index) => (
        // Keyed on the slot, not the exercise: the same exercise can appear
        // more than once in a workout.
        <WorkoutExerciseRow
          key={workoutExercise.id}
          workoutExercise={workoutExercise}
          number={index + 1}
        />
      ))}
    </ol>
  );
};
