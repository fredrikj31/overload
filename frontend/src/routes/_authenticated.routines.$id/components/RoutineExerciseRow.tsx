import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@shadcn-ui/components/ui/badge";
import type { RoutineExerciseListItem } from "../../../api/queries/routines/types";
import { getMediaUrl } from "../../../utils/getMediaUrl";

type RoutineExerciseRowProps = {
  routineExercise: RoutineExerciseListItem;
  /** 1-based display number. Not `position`, which may have gaps. */
  number: number;
};

// Adapted from the exercises page's ExerciseRow, with a leading slot number.
export const RoutineExerciseRow = ({
  routineExercise,
  number,
}: RoutineExerciseRowProps) => {
  const { exercise } = routineExercise;

  return (
    <li>
      <Link
        to={`/exercises/${exercise.id}`}
        className="flex items-center gap-3 px-3 py-2.5 transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
      >
        <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
          {number}
        </span>
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
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
};
