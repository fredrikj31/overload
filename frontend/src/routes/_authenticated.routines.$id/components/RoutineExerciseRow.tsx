import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@shadcn-ui/components/ui/badge";
import * as bodyPartSchema from "../../../types/bodyPart";
import * as equipmentSchema from "../../../types/equipment";
import * as exerciseSchema from "../../../types/exercise";
import * as routineExerciseSchema from "../../../types/routineExercise";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";
import { getMediaUrl } from "../../../utils/getMediaUrl";
import { RoutineExerciseSets } from "./RoutineExerciseSets";

type RoutineExerciseRowProps = {
  routineExercise: Pick<
    routineExerciseSchema.RoutineExercise,
    "id" | "routineId" | "exerciseId" | "position"
  > & {
    exercise: Pick<exerciseSchema.Exercise, "id" | "name" | "imagePath"> & {
      bodyPart: Pick<bodyPartSchema.BodyPart, "id" | "name" | "slug"> | null;
      equipment: Pick<equipmentSchema.Equipment, "id" | "name" | "slug">;
    };
    sets: Pick<
      routineExerciseSetSchema.RoutineExerciseSet,
      | "id"
      | "routineExerciseId"
      | "position"
      | "type"
      | "reps"
      | "weightUnit"
      | "weight"
    >[];
  };
  /** 1-based display number. Not `position`, which may have gaps. */
  number: number;
};

// Adapted from the exercises page's ExerciseRow, with a leading slot number
// and the slot's planned sets underneath.
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
      {/* Outside the link, since interactive content is not allowed inside
          an <a>. On wider screens it is indented past the number, image and
          gaps to line up with the exercise name; phones use the full width. */}
      <div className="px-3 pb-2.5 sm:pl-27">
        <RoutineExerciseSets
          routineId={routineExercise.routineId}
          routineExerciseId={routineExercise.id}
          sets={routineExercise.sets}
        />
      </div>
    </li>
  );
};
