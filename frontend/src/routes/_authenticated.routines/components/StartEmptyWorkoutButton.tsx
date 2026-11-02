import { Play } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@shadcn-ui/components/ui/button";
import { ApiError } from "../../../api/errors";
import { useStartWorkout } from "../../../api/workouts/startWorkout/useStartWorkout";

/**
 * Starts an empty workout (no routine, no exercises) and redirects to it.
 * The backend refuses with 409 while a workout is already in progress; that
 * message is surfaced as a toast.
 */
export const StartEmptyWorkoutButton = () => {
  const navigate = useNavigate();
  const { mutate: startWorkout, isPending } = useStartWorkout();

  const handleClick = () => {
    startWorkout(undefined, {
      onSuccess: (workout) => {
        void navigate(`/workouts/${workout.id}`);
      },
      onError: (error) => {
        console.error(error);

        const message =
          error instanceof ApiError ? error.message : "Could not start workout";

        toast.error(message, { position: "bottom-right" });
      },
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={isPending}
      onClick={handleClick}
    >
      <Play />
      {isPending ? "Starting..." : "Start empty workout"}
    </Button>
  );
};
