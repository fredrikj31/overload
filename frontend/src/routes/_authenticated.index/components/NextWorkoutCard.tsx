import { CalendarDays, Play } from "lucide-react";
import { Badge } from "@shadcn-ui/components/ui/badge";
import { Button } from "@shadcn-ui/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import { formatDuration } from "../format";
import type { PlannedWorkout } from "../mock";

type NextWorkoutCardProps = {
  workout: PlannedWorkout;
};

export const NextWorkoutCard = ({ workout }: NextWorkoutCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name}</CardTitle>
        <CardDescription>
          {formatDuration(workout.estimatedMinutes)} ·{" "}
          {workout.exercises.length} exercises
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">
            <CalendarDays /> Today
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {workout.exercises.map((exercise) => (
            <li
              key={exercise.name}
              className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
            >
              <span>{exercise.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {exercise.sets} × {exercise.reps}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled>
          <Play /> Start workout
        </Button>
      </CardFooter>
    </Card>
  );
};
