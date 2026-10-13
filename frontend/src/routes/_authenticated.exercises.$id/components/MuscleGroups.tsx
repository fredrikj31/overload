import { Badge } from "@shadcn-ui/components/ui/badge";
import type { ExerciseMuscle } from "../../../api/queries/exercises/types";

type MuscleGroupsProps = {
  muscles: ExerciseMuscle[];
};

export const MuscleGroups = ({ muscles }: MuscleGroupsProps) => {
  const primary = muscles.filter((muscle) => muscle.role === "primary");
  const secondary = muscles.filter((muscle) => muscle.role === "secondary");

  if (primary.length === 0 && secondary.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {primary.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h2 className="text-sm font-medium text-muted-foreground">
            Primary muscles
          </h2>
          <div className="flex flex-wrap gap-1">
            {primary.map((muscle) => (
              <Badge key={muscle.id}>{muscle.name}</Badge>
            ))}
          </div>
        </div>
      ) : null}
      {secondary.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h2 className="text-sm font-medium text-muted-foreground">
            Secondary muscles
          </h2>
          <div className="flex flex-wrap gap-1">
            {secondary.map((muscle) => (
              <Badge key={muscle.id} variant="outline">
                {muscle.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
