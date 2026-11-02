import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@shadcn-ui/components/ui/badge";
import { buttonVariants } from "@shadcn-ui/components/ui/button";
import { Skeleton } from "@shadcn-ui/components/ui/skeleton";
import { cn } from "@shadcn-ui/lib/utils";
import { ApiError } from "../../api/errors";
import { useGetWorkout } from "../../api/workouts/getWorkout/useGetWorkout";
import { QueryErrorState } from "../../components/QueryErrorState";
import { ElapsedTime } from "./components/ElapsedTime";

const formatStartedAt = (startedAt: string): string =>
  new Date(startedAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

export const WorkoutDetailRoute = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: workout,
    isPending,
    isError,
    error,
    refetch,
  } = useGetWorkout(id);

  // The backend answers 404 for deleted workouts and for other users'
  // workouts alike; both are shown as "not found" rather than as a failure.
  const isNotFound =
    isError && error instanceof ApiError && error.status === 404;

  useEffect(() => {
    if (isError && !isNotFound) {
      console.error(error);
      toast.error("Could not load workout", { position: "bottom-right" });
    }
  }, [isError, isNotFound, error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-8 md:p-6">
      <Link
        to="/routines"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "self-start",
        )}
      >
        <ArrowLeft /> Routines
      </Link>

      {isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-5 w-40" />
        </div>
      ) : isNotFound ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
          <p>Workout not found.</p>
          <Link to="/routines" className={buttonVariants({ variant: "link" })}>
            Back to routines
          </Link>
        </div>
      ) : isError ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight wrap-break-word">
                {workout.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Started {formatStartedAt(workout.startedAt)} ·{" "}
                <ElapsedTime
                  since={workout.startedAt}
                  until={workout.endedAt}
                />
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {workout.endedAt ? "Finished" : "In progress"}
            </Badge>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Exercises</h2>
            <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
              <p>No exercises yet.</p>
              <p>Adding exercises to a workout is coming soon.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
