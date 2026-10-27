import { useEffect } from "react";
import { toast } from "sonner";
import { useListRoutines } from "../../api/routines/listRoutines/useListRoutines";
import { QueryErrorState } from "../../components/QueryErrorState";
import { CreateRoutineDialog } from "./components/CreateRoutineDialog";
import { RoutineCard } from "./components/RoutineCard";
import { RoutineListSkeleton } from "./components/RoutineListSkeleton";

export const RoutinesRoute = () => {
  const { data, isPending, isError, error, refetch } = useListRoutines();

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error("Could not load routines", { position: "bottom-right" });
    }
  }, [isError, error]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-8 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Routines</h1>
          <p className="text-sm text-muted-foreground">
            Build routines from your favourite exercises.
          </p>
        </div>
        <CreateRoutineDialog />
      </div>

      {isPending ? (
        <RoutineListSkeleton />
      ) : isError ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
          <p>No routines yet.</p>
          <p>Create one with the plus button.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </ul>
      )}
    </div>
  );
};
