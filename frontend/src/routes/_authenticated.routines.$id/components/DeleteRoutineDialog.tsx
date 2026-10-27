import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { useDeleteRoutine } from "../../../api/routines/deleteRoutine/useDeleteRoutine";
import { ApiError } from "../../../api/errors";
import { queryKeys } from "../../../api/queryKeys";
import * as routineSchema from "../../../types/routine";

interface DeleteRoutineDialogProps {
  routine: Pick<routineSchema.Routine, "id" | "name" | "description">;
}

export const DeleteRoutineDialog = ({ routine }: DeleteRoutineDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: deleteRoutine, isPending } = useDeleteRoutine();

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog open while the request is in flight so the user sees
    // the outcome; closing is allowed again once it settles.
    if (!nextOpen && isPending) return;

    setOpen(nextOpen);
  };

  const handleConfirm = () => {
    deleteRoutine(routine.id, {
      onSuccess: () => {
        toast.success("Routine deleted", { position: "bottom-right" });
        setOpen(false);
        void navigate("/routines");
      },
      onError: (error) => {
        console.error(error);

        const message =
          error instanceof ApiError
            ? error.message
            : "Could not delete routine";

        toast.error(message, { position: "bottom-right" });

        // A 404 means the routine is already gone (deleted elsewhere), so the
        // cached list is stale and there is nothing left to show here.
        if (error instanceof ApiError && error.status === 404) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.routines.list,
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
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete routine"
          />
        }
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete routine</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{routine.name}&rdquo;? This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
