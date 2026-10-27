import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import * as routineSchema from "../../../types/routine";

type RoutineCardProps = {
  routine: Pick<routineSchema.Routine, "id" | "name" | "description">;
};

export const RoutineCard = ({ routine }: RoutineCardProps) => {
  const description = routine.description?.trim();

  return (
    <li>
      <Link
        to={`/routines/${routine.id}`}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="truncate">{routine.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {description ? (
                description
              ) : (
                <span className="italic">No description</span>
              )}
            </CardDescription>
            <CardAction className="self-center">
              <ChevronRight className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
        </Card>
      </Link>
    </li>
  );
};
