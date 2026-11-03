import { useState } from "react";
import { Flag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@shadcn-ui/components/ui/alert-dialog";
import { Button } from "@shadcn-ui/components/ui/button";
import { ApiError } from "../../../api/errors";
import { getWorkoutQueryOptions } from "../../../api/workouts/getWorkout/useGetWorkout";
import { useFinishWorkout } from "../../../api/workouts/finishWorkout/useFinishWorkout";
import { Workout } from "../../../types/workout";

type FinishWorkoutDialogProps = {
  workout: Pick<Workout, "id" | "name">;
};

/**
 * "Finish" button with a confirmation dialog. Finishing is irreversible and
 * the button is used mid-workout, so a stray tap must not end the session.
 */
export const FinishWorkoutDialog = ({ workout }: FinishWorkoutDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: finishWorkout, isPending } = useFinishWorkout();

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog open while the request is in flight so the user sees
    // the outcome; closing is allowed again once it settles.
    if (!nextOpen && isPending) return;
    setOpen(nextOpen);
  };

  const handleConfirm = () => {
    finishWorkout(workout.id, {
      onSuccess: () => {
        toast.success("Workout finished", { position: "bottom-right" });
        setOpen(false);
        void navigate("/routines");
      },
      onError: (error) => {
        console.error(error);
        const message =
          error instanceof ApiError
            ? error.message
            : "Could not finish workout";
        toast.error(message, { position: "bottom-right" });

        // 409 means the workout was already finished elsewhere and 404 that it
        // is gone; either way the cached detail is stale and there is nothing
        // left to do on this screen.
        if (
          error instanceof ApiError &&
          (error.status === 409 || error.status === 404)
        ) {
          void queryClient.invalidateQueries({
            queryKey: getWorkoutQueryOptions(workout.id).queryKey,
          });
          setOpen(false);
          void navigate("/routines");
        }
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button size="sm" className="min-h-11" aria-label="Finish workout" />
        }
      >
        <Flag /> Finish
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finish workout</AlertDialogTitle>
          <AlertDialogDescription>
            Finish &ldquo;{workout.name}&rdquo;? The elapsed time stops now and
            the workout cannot be resumed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Finishing..." : "Finish workout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
