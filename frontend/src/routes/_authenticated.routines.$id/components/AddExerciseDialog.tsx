import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useAddRoutineExercise } from "../../../api/actions/addRoutineExercise/useAddRoutineExercise";
import { ApiError } from "../../../api/errors";
import { exercisesQueryKey } from "../../../api/queries/exercises/listExercises/useListExercises";
import * as exerciseSchema from "../../../types/exercise";
import { routinesQueryKey } from "../../../api/queries/routines/listRoutines/useListRoutines";
import * as routineSchema from "../../../types/routine";
import { ExercisePicker } from "./ExercisePicker";

interface AddExerciseDialogProps {
  routine: Pick<routineSchema.Routine, "id" | "name" | "description">;
}

export const AddExerciseDialog = ({ routine }: AddExerciseDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: addRoutineExercise, isPending } = useAddRoutineExercise();

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog open while a request is in flight so the user sees
    // the outcome; closing is allowed again once it settles.
    if (!nextOpen && isPending) return;

    setOpen(nextOpen);
  };

  const handleSelect = (
    exercise: Pick<exerciseSchema.Exercise, "id" | "name">,
  ) => {
    addRoutineExercise(
      { routineId: routine.id, exerciseId: exercise.id },
      {
        onSuccess: () => {
          toast.success(`Added ${exercise.name}`, { position: "bottom-right" });
          setOpen(false);
        },
        onError: (error) => {
          console.error(error);

          const message =
            error instanceof ApiError
              ? error.message
              : "Could not add exercise";

          toast.error(message, { position: "bottom-right" });

          if (error instanceof ApiError && error.status === 404) {
            if (error.code === "routine-not-found") {
              // The routine is gone (deleted elsewhere), so the cached list
              // is stale and there is nothing left to add to here.
              void queryClient.invalidateQueries({
                queryKey: routinesQueryKey,
              });
              setOpen(false);
              void navigate("/routines");
            } else {
              // The exercise is gone from the library; refresh the list and
              // let the user pick another one.
              void queryClient.invalidateQueries({
                queryKey: exercisesQueryKey,
              });
            }
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus /> Add exercise
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>
            Search the library and pick an exercise to append to {routine.name}.
          </DialogDescription>
        </DialogHeader>

        {/* Rendered inside the content so the exercises query only runs
            once the dialog is open. */}
        <ExercisePicker disabled={isPending} onSelect={handleSelect} />

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
