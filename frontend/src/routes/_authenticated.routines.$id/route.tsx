import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { buttonVariants } from "@shadcn-ui/components/ui/button";
import { Skeleton } from "@shadcn-ui/components/ui/skeleton";
import { cn } from "@shadcn-ui/lib/utils";
import { useRoutine } from "../../api/queries/routines/listRoutines/useListRoutines";
import { QueryErrorState } from "../../components/QueryErrorState";
import { DeleteRoutineDialog } from "./components/DeleteRoutineDialog";

export const RoutineDetailRoute = () => {
  const { id } = useParams<{ id: string }>();
  const { data: routine, isPending, isError, error, refetch } = useRoutine(id);

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error("Could not load routine", { position: "bottom-right" });
    }
  }, [isError, error]);

  const description = routine?.description?.trim();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-8 md:p-6">
      <Link
        to="/routines"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "self-start",
        )}
      >
        <ArrowLeft /> Routines
      </Link>

      {isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-5 w-40" />
        </div>
      ) : isError ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : !routine ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
          <p>Routine not found.</p>
          <Link to="/routines" className={buttonVariants({ variant: "link" })}>
            Back to routines
          </Link>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {routine.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {description ? (
                description
              ) : (
                <span className="italic">No description</span>
              )}
            </p>
          </div>
          <DeleteRoutineDialog routine={routine} />
        </div>
      )}
    </div>
  );
};
