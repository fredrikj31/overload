import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@shadcn-ui/components/ui/badge";
import * as bodyPartSchema from "../../../types/bodyPart";
import * as equipmentSchema from "../../../types/equipment";
import * as exerciseSchema from "../../../types/exercise";
import * as muscleExerciseSchema from "../../../types/muscleExercise";
import * as muscleSchema from "../../../types/muscle";
import { getMediaUrl } from "../../../utils/getMediaUrl";

type ExerciseRowProps = {
  exercise: Pick<
    exerciseSchema.Exercise,
    "id" | "name" | "instructions" | "imagePath" | "gifPath" | "attribution"
  > & {
    bodyPart: Pick<bodyPartSchema.BodyPart, "id" | "name" | "slug"> | null;
    equipment: Pick<equipmentSchema.Equipment, "id" | "name" | "slug">;
    muscles: (Pick<muscleSchema.Muscle, "id" | "name" | "slug"> &
      Pick<muscleExerciseSchema.MuscleExercise, "role">)[];
  };
};

export const ExerciseRow = ({ exercise }: ExerciseRowProps) => {
  return (
    <li>
      <Link
        to={`/exercises/${exercise.id}`}
        className="flex items-center gap-3 px-3 py-2.5 transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
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
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
};
