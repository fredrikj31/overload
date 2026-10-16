import { Card, CardHeader } from "@shadcn-ui/components/ui/card";
import { Skeleton } from "@shadcn-ui/components/ui/skeleton";

const ROWS = Array.from({ length: 4 }, (_, index) => index);

export const RoutineListSkeleton = () => {
  return (
    <ul className="flex flex-col gap-3" aria-busy="true">
      {ROWS.map((row) => (
        <li key={row}>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  );
};
