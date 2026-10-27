import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@shadcn-ui/components/ui/button";
import { useListExercises } from "../../api/exercises/listExercises/useListExercises";
import { QueryErrorState } from "../../components/QueryErrorState";
import { ExerciseListSkeleton } from "./components/ExerciseListSkeleton";
import { ExerciseRow } from "./components/ExerciseRow";
import { ExerciseSearch } from "./components/ExerciseSearch";

const PAGE_SIZE = 50;

export const ExercisesRoute = () => {
  const [query, setQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const { data, isPending, isError, error, refetch } = useListExercises();

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error("Could not load exercises", { position: "bottom-right" });
    }
  }, [isError, error]);

  const filtered = useMemo(() => {
    const exercises = data ?? [];
    const needle = query.trim().toLowerCase();

    if (!needle) return exercises;

    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(needle),
    );
  }, [data, query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-8 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Exercises</h1>
        <p className="text-sm text-muted-foreground">
          Browse the exercise library.
        </p>
      </div>

      <ExerciseSearch value={query} onChange={handleQueryChange} />

      {isPending ? (
        <ExerciseListSkeleton />
      ) : isError ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} of {data.length} exercises
          </p>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
              <p>No exercises match &ldquo;{query.trim()}&rdquo;.</p>
              <Button variant="link" onClick={() => handleQueryChange("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <>
              <ul className="divide-y rounded-xl border">
                {visible.map((exercise) => (
                  <ExerciseRow key={exercise.id} exercise={exercise} />
                ))}
              </ul>
              {remaining > 0 ? (
                <Button
                  variant="outline"
                  className="self-center"
                  onClick={() =>
                    setVisibleCount((previous) => previous + PAGE_SIZE)
                  }
                >
                  Show more ({remaining} remaining)
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
};
