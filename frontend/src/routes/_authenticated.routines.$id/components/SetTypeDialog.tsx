import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@shadcn-ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shadcn-ui/components/ui/dialog";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";
import { useUpdateRoutineExerciseSet } from "../../../api/actions/updateRoutineExerciseSet/useUpdateRoutineExerciseSet";
import { ApiError } from "../../../api/errors";
import { queryKeys } from "../../../api/queryKeys";
import { cn } from "@shadcn-ui/lib/utils";
import {
  SET_TYPE_DESCRIPTIONS,
  SET_TYPE_LABELS,
  SET_TYPE_MARKERS,
} from "./setTypes";

type SetTypeDialogProps = {
  routineId: string;
  routineExerciseId: string;
  set: Pick<
    routineExerciseSetSchema.RoutineExerciseSet,
    | "id"
    | "routineExerciseId"
    | "position"
    | "type"
    | "reps"
    | "weightUnit"
    | "weight"
  >;
  /**
   * 1-based number among the normal (working) sets; warm-up, failure and
   * drop sets don't count. For a non-normal set it is the number the set
   * would take if switched to normal. Not `position`, which may have gaps.
   */
  number: number;
};

/**
 * The set badge at the start of a set row. Shows the set number, or a letter
 * for warm-up / failure / drop sets, and opens a dialog to change the type.
 */
export const SetTypeDialog = ({
  routineId,
  routineExerciseId,
  set,
  number,
}: SetTypeDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: updateRoutineExerciseSet, isPending } =
    useUpdateRoutineExerciseSet();

  const marker = set.type === "normal" ? null : SET_TYPE_MARKERS[set.type];

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog open while a request is in flight so the user sees
    // the outcome; closing is allowed again once it settles.
    if (!nextOpen && isPending) return;

    setOpen(nextOpen);
  };

  const handleSelect = (type: routineExerciseSetSchema.SetType) => {
    if (type === set.type) {
      setOpen(false);
      return;
    }

    updateRoutineExerciseSet(
      { routineId, routineExerciseId, setId: set.id, body: { type } },
      {
        onSuccess: () => {
          setOpen(false);
        },
        onError: (error) => {
          console.error(error);

          const message =
            error instanceof ApiError
              ? error.message
              : "Could not change set type";

          toast.error(message, { position: "bottom-right" });

          if (error instanceof ApiError && error.status === 404) {
            setOpen(false);
            if (error.code === "routine-not-found") {
              // The routine is gone (deleted elsewhere), so the cached list
              // is stale and there is nothing left to edit here.
              void queryClient.invalidateQueries({
                queryKey: queryKeys.routines.list,
              });
              void navigate("/routines");
            } else {
              // The slot or set is gone; refresh the list so it drops out.
              void queryClient.invalidateQueries({
                queryKey: queryKeys.routines.exercises(routineId),
              });
            }
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Set ${number}: ${SET_TYPE_LABELS[set.type]}. Change set type`}
            className={cn("font-semibold tabular-nums", marker?.className)}
          />
        }
      >
        {marker ? marker.letter : number}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set type</DialogTitle>
          <DialogDescription>
            Choose how set {number} should be performed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2" role="radiogroup">
          {routineExerciseSetSchema.SET_TYPES.map((type) => {
            const selected = type === set.type;
            const typeMarker =
              type === "normal" ? null : SET_TYPE_MARKERS[type];

            return (
              <Button
                key={type}
                type="button"
                role="radio"
                aria-checked={selected}
                variant={selected ? "secondary" : "outline"}
                size="lg"
                className="h-auto justify-start gap-3 px-3 py-2 text-left whitespace-normal"
                disabled={isPending}
                onClick={() => handleSelect(type)}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border bg-background font-semibold tabular-nums",
                    typeMarker?.className,
                  )}
                >
                  {typeMarker ? typeMarker.letter : number}
                </span>
                <span className="flex flex-col">
                  <span className="font-medium">{SET_TYPE_LABELS[type]}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {SET_TYPE_DESCRIPTIONS[type]}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
