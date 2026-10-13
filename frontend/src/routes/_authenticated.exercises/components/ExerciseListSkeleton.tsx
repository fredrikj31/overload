import { Skeleton } from "@shadcn-ui/components/ui/skeleton";

const ROWS = Array.from({ length: 8 }, (_, index) => index);

export const ExerciseListSkeleton = () => {
  return (
    <ul className="divide-y rounded-xl border" aria-busy="true">
      {ROWS.map((row) => (
        <li key={row} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-12 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        </li>
      ))}
    </ul>
  );
};
