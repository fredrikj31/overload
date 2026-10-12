import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import { Progress } from "@shadcn-ui/components/ui/progress";
import type { MuscleSets } from "../mock";

type MusclesTrainedCardProps = {
  muscles: MuscleSets[];
};

export const MusclesTrainedCard = ({ muscles }: MusclesTrainedCardProps) => {
  const maxSets = Math.max(0, ...muscles.map((muscle) => muscle.sets));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Muscles trained</CardTitle>
        <CardDescription>Sets per muscle group this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {muscles.map((muscle) => (
            <li key={muscle.muscle} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{muscle.muscle}</span>
                <span className="text-muted-foreground tabular-nums">
                  {muscle.sets} sets
                </span>
              </div>
              <Progress
                value={maxSets > 0 ? (muscle.sets / maxSets) * 100 : 0}
                aria-label={`${muscle.muscle}: ${muscle.sets} sets`}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
