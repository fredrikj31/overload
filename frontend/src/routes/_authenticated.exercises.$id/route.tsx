import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@shadcn-ui/components/ui/badge";
import { buttonVariants } from "@shadcn-ui/components/ui/button";
import { Skeleton } from "@shadcn-ui/components/ui/skeleton";
import { cn } from "@shadcn-ui/lib/utils";
import { useExercise } from "../../api/queries/exercises/listExercises/useListExercises";
import { QueryErrorState } from "../../components/QueryErrorState";
import { ExerciseGif } from "./components/ExerciseGif";
import { InstructionsList } from "./components/InstructionsList";
import { MuscleGroups } from "./components/MuscleGroups";

export const ExerciseDetailRoute = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: exercise,
    isPending,
    isError,
    error,
    refetch,
  } = useExercise(id);

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error("Could not load exercise", { position: "bottom-right" });
    }
  }, [isError, error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-8 md:p-6">
      <Link
        to="/exercises"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "self-start",
        )}
      >
        <ArrowLeft /> Exercises
      </Link>

      {isPending ? (
        <div className="flex flex-col gap-6" aria-busy="true">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="md:grid md:grid-cols-[minmax(0,320px)_1fr] md:items-start md:gap-8">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="mt-6 flex flex-col gap-3 md:mt-0">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : !exercise ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
          <p>Exercise not found.</p>
          <Link to="/exercises" className={buttonVariants({ variant: "link" })}>
            Back to exercises
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight first-letter:uppercase">
              {exercise.name}
            </h1>
            <div className="flex flex-wrap gap-1">
              {exercise.bodyPart ? (
                <Badge variant="secondary">{exercise.bodyPart.name}</Badge>
              ) : null}
              <Badge variant="outline">{exercise.equipment.name}</Badge>
            </div>
          </div>

          <div className="md:grid md:grid-cols-[minmax(0,320px)_1fr] md:items-start md:gap-8">
            <ExerciseGif
              imagePath={exercise.imagePath}
              gifPath={exercise.gifPath}
              alt={exercise.name}
            />
            <div className="mt-6 flex flex-col gap-6 md:mt-0">
              <MuscleGroups muscles={exercise.muscles} />
              <InstructionsList instructions={exercise.instructions} />
              {exercise.attribution ? (
                <p className="text-xs text-muted-foreground">
                  {exercise.attribution}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
