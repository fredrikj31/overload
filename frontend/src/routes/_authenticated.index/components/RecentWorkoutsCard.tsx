import { ChevronRight, Clock, Dumbbell, Weight } from "lucide-react";
import { Button } from "@shadcn-ui/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import { formatDuration, formatVolume } from "../format";
import type { WorkoutSession } from "../mock";

type RecentWorkoutsCardProps = {
  workouts: WorkoutSession[];
};

export const RecentWorkoutsCard = ({ workouts }: RecentWorkoutsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent workouts</CardTitle>
        <CardDescription>Your last {workouts.length} sessions</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" disabled>
            View all <ChevronRight />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {workouts.map((workout) => (
            <li
              key={workout.id}
              className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{workout.name}</span>
                <span className="text-xs text-muted-foreground">
                  {workout.date}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {formatDuration(workout.durationMinutes)}
                </span>
                <span className="flex items-center gap-1">
                  <Weight className="size-3.5" />
                  {formatVolume(workout.volumeKg)}
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="size-3.5" />
                  {workout.exerciseCount} exercises
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
