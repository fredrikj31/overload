import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@shadcn-ui/components/ui/badge";
import { Button } from "@shadcn-ui/components/ui/button";
import { useListExercises } from "../../../api/queries/exercises/listExercises/useListExercises";
import type { ExerciseListItem } from "../../../api/queries/exercises/types";
import { QueryErrorState } from "../../../components/QueryErrorState";
import { ExerciseListSkeleton } from "../../_authenticated.exercises/components/ExerciseListSkeleton";
import { ExerciseSearch } from "../../_authenticated.exercises/components/ExerciseSearch";
import { getMediaUrl } from "../../../utils/getMediaUrl";

const PAGE_SIZE = 50;

type ExercisePickerRowProps = {
  exercise: ExerciseListItem;
  disabled: boolean;
  onSelect: (exercise: ExerciseListItem) => void;
};

// Button version of the exercises page's ExerciseRow, which is a link.
const ExercisePickerRow = ({
  exercise,
  disabled,
  onSelect,
}: ExercisePickerRowProps) => {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(exercise)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <img
          src={getMediaUrl(exercise.imagePath)}
          alt=""
          loading="lazy"
          decoding="async"
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-md bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm font-medium first-letter:uppercase">
            {exercise.name}
          </span>
          <div className="flex flex-wrap gap-1">
            {exercise.bodyPart ? (
              <Badge variant="secondary">{exercise.bodyPart.name}</Badge>
            ) : null}
            <Badge variant="outline">{exercise.equipment.name}</Badge>
          </div>
        </div>
        <Plus className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
};

type ExercisePickerProps = {
  disabled: boolean;
  onSelect: (exercise: ExerciseListItem) => void;
};

/**
 * Searchable list of the exercise library. Mount it only while it is visible
 * (e.g. inside a dialog's content) so the exercises query runs on demand.
 */
export const ExercisePicker = ({ disabled, onSelect }: ExercisePickerProps) => {
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
    // min-w-0: the dialog body is a grid, and without this the column grows
    // to fit the longest (nowrap, truncated) exercise name and overflows the
    // dialog instead of truncating.
    <div className="flex min-w-0 flex-col gap-3">
      <ExerciseSearch value={query} onChange={handleQueryChange} autoFocus />

      {isPending ? (
        <ExerciseListSkeleton />
      ) : isError ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
          <p>No exercises match &ldquo;{query.trim()}&rdquo;.</p>
          <Button variant="link" onClick={() => handleQueryChange("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <>
          {/* The list is the scroll container so its border wraps the
              scrollbar. The Show more button stays visible below it. */}
          <ul className="max-h-[50vh] divide-y overflow-y-auto rounded-xl border">
            {visible.map((exercise) => (
              <ExercisePickerRow
                key={exercise.id}
                exercise={exercise}
                disabled={disabled}
                onSelect={onSelect}
              />
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
  );
};
