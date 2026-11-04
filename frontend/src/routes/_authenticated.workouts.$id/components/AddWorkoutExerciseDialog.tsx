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
import { ApiError } from "../../../api/errors";
import { queryKeys } from "../../../api/queryKeys";
import { useAddWorkoutExercise } from "../../../api/workouts/addWorkoutExercise/useAddWorkoutExercise";
import { getWorkoutQueryOptions } from "../../../api/workouts/getWorkout/useGetWorkout";
import { ExercisePicker } from "../../../components/ExercisePicker";
import * as exerciseSchema from "../../../types/exercise";
import * as workoutSchema from "../../../types/workout";

type AddWorkoutExerciseDialogProps = {
  workout: Pick<workoutSchema.Workout, "id" | "name">;
};

/**
 * "Add exercise" button with a searchable picker. Only rendered while the
 * workout is in progress; the backend rejects additions once it has ended.
 */
export const AddWorkoutExerciseDialog = ({
  workout,
}: AddWorkoutExerciseDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: addWorkoutExercise, isPending } = useAddWorkoutExercise();

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog open while a request is in flight so the user sees
    // the outcome; closing is allowed again once it settles.
    if (!nextOpen && isPending) return;

    setOpen(nextOpen);
  };

  const handleSelect = (
    exercise: Pick<exerciseSchema.Exercise, "id" | "name">,
  ) => {
    addWorkoutExercise(
      { workoutId: workout.id, exerciseId: exercise.id },
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

          if (!(error instanceof ApiError)) return;

          if (error.status === 409) {
            // The workout was finished elsewhere. Refresh the cached detail
            // so the status badge flips and this button disappears.
            void queryClient.invalidateQueries({
              queryKey: getWorkoutQueryOptions(workout.id).queryKey,
            });
            setOpen(false);
            return;
          }

          if (error.status === 404) {
            if (error.code === "workout-not-found") {
              // The workout is gone (deleted elsewhere), so the cached detail
              // is stale and there is nothing left to add to here.
              void queryClient.invalidateQueries({
                queryKey: getWorkoutQueryOptions(workout.id).queryKey,
              });
              setOpen(false);
              void navigate("/routines");
            } else {
              // The exercise is gone from the library; refresh the list and
              // let the user pick another one.
              void queryClient.invalidateQueries({
                queryKey: queryKeys.exercises.list,
              });
            }
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" className="min-h-11" />}>
        <Plus /> Add exercise
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>
            Search the library and pick an exercise to append to {workout.name}.
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
