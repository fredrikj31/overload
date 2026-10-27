import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@shadcn-ui/components/ui/button";
import type { RoutineExerciseSet } from "../../../api/actions/addRoutineExerciseSet/types";
import { useAddRoutineExerciseSet } from "../../../api/actions/addRoutineExerciseSet/useAddRoutineExerciseSet";
import { ApiError } from "../../../api/errors";
import { routineExercisesQueryKey } from "../../../api/queries/routines/listRoutineExercises/useListRoutineExercises";
import { routinesQueryKey } from "../../../api/queries/routines/listRoutines/useListRoutines";
import { RoutineExerciseSetRow } from "./RoutineExerciseSetRow";

type RoutineExerciseSetsProps = {
  routineId: string;
  routineExerciseId: string;
  sets: RoutineExerciseSet[];
};

/**
 * The planned sets of one exercise slot as a small table (set, weight, reps)
 * with an "Add set" button underneath. Adding creates the set straight away,
 * copying the previous set so it only needs tweaking; the first set starts
 * as a normal bodyweight set with 0 reps.
 */
export const RoutineExerciseSets = ({
  routineId,
  routineExerciseId,
  sets,
}: RoutineExerciseSetsProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: addRoutineExerciseSet, isPending } =
    useAddRoutineExerciseSet();

  const handleAdd = () => {
    const last = sets.at(-1);
    const body = last
      ? {
          reps: last.reps,
          weight: last.weight,
          weightUnit: last.weightUnit,
          type: last.type,
        }
      : { reps: 0, weight: null };

    addRoutineExerciseSet(
      { routineId, routineExerciseId, body },
      {
        onError: (error) => {
          console.error(error);

          const message =
            error instanceof ApiError ? error.message : "Could not add set";

          toast.error(message, { position: "bottom-right" });

          if (error instanceof ApiError && error.status === 404) {
            if (error.code === "routine-not-found") {
              // The routine is gone (deleted elsewhere), so the cached list
              // is stale and there is nothing left to add to here.
              void queryClient.invalidateQueries({
                queryKey: routinesQueryKey,
              });
              void navigate("/routines");
            } else {
              // The exercise slot is gone; refresh the list so it drops out.
              void queryClient.invalidateQueries({
                queryKey: routineExercisesQueryKey(routineId),
              });
            }
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 px-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        <span className="text-center">Set</span>
        <span className="text-center">Weight</span>
        <span className="text-center">Reps</span>
      </div>

      {sets.length > 0 ? (
        <ol className="flex flex-col gap-1.5">
          {sets.map((set, index) => (
            <RoutineExerciseSetRow
              key={set.id}
              routineId={routineId}
              routineExerciseId={routineExerciseId}
              set={set}
              number={index + 1}
            />
          ))}
        </ol>
      ) : (
        <p className="py-1 text-center text-sm text-muted-foreground">
          No sets yet.
        </p>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={handleAdd}
        disabled={isPending}
      >
        <Plus /> {isPending ? "Adding..." : "Add set"}
      </Button>
    </div>
  );
};
