import { Check } from "lucide-react";
import { cn } from "@shadcn-ui/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import type { WeekDay } from "../mock";

type WeeklyActivityCardProps = {
  days: WeekDay[];
};

export const WeeklyActivityCard = ({ days }: WeeklyActivityCardProps) => {
  const trainedCount = days.filter((day) => day.trained).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>
          {trainedCount} of {days.length} days trained
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{day.label}</span>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-xs font-medium",
                  day.trained
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  day.isToday &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                {day.trained ? <Check className="size-4" /> : null}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" /> Trained
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted" /> Rest
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full ring-2 ring-primary ring-offset-1 ring-offset-background" />{" "}
            Today
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
