import { FormEvent, useState } from "react";
import { Pencil } from "lucide-react";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@shadcn-ui/components/ui/field";
import { Input } from "@shadcn-ui/components/ui/input";
import { Textarea } from "@shadcn-ui/components/ui/textarea";
import {
  UpdateRoutineBody,
  UpdateRoutineBodySchema,
} from "../../../api/actions/updateRoutine/types";
import { useUpdateRoutine } from "../../../api/actions/updateRoutine/useUpdateRoutine";
import { ApiError } from "../../../api/errors";
import { routinesQueryKey } from "../../../api/queries/routines/listRoutines/useListRoutines";
import { Routine } from "../../../api/queries/routines/types";

type FieldName = "name" | "description";
type FieldErrors = Partial<Record<FieldName, string>>;

const isFieldName = (value: unknown): value is FieldName =>
  value === "name" || value === "description";

interface EditRoutineDialogProps {
  routine: Routine;
}

export const EditRoutineDialog = ({ routine }: EditRoutineDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(routine.name);
  const [description, setDescription] = useState<string>(
    routine.description ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: updateRoutine, isPending } = useUpdateRoutine();

  const currentDescription = routine.description ?? "";
  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const hasChanges =
    trimmedName !== routine.name || trimmedDescription !== currentDescription;

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog open while a request is in flight so the user sees
    // the outcome; closing is allowed again once it settles.
    if (!nextOpen && isPending) return;

    if (nextOpen) {
      // Prefill on every open (not just on mount) so the form reflects the
      // latest values if the routine changed since the dialog was last used.
      setName(routine.name);
      setDescription(currentDescription);
      setFieldErrors({});
    }

    setOpen(nextOpen);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Only send the fields that changed. The backend rejects an empty body,
    // so a no-op submit just closes the dialog.
    const body: UpdateRoutineBody = {};
    if (trimmedName !== routine.name) body.name = name;
    if (trimmedDescription !== currentDescription) {
      // Clear the description with null when the user empties the field.
      body.description = trimmedDescription === "" ? null : description;
    }

    if (Object.keys(body).length === 0) {
      setOpen(false);
      return;
    }

    const parsed = UpdateRoutineBodySchema.safeParse(body);

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (isFieldName(field) && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    updateRoutine(
      { id: routine.id, body: parsed.data },
      {
        onSuccess: () => {
          toast.success("Routine updated", { position: "bottom-right" });
          setOpen(false);
        },
        onError: (error) => {
          console.error(error);

          const message =
            error instanceof ApiError
              ? error.message
              : "Could not update routine";

          toast.error(message, { position: "bottom-right" });

          if (error instanceof ApiError && error.status === 400) {
            setFieldErrors({ name: error.message });
          }

          // A 404 means the routine is gone (deleted elsewhere), so the cached
          // list is stale and there is nothing left to edit here.
          if (error instanceof ApiError && error.status === 404) {
            void queryClient.invalidateQueries({ queryKey: routinesQueryKey });
            setOpen(false);
            void navigate("/routines");
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Edit routine" />
        }
      >
        <Pencil />
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Edit routine</DialogTitle>
            <DialogDescription>
              Change the name or description of this routine.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field data-invalid={fieldErrors.name ? true : undefined}>
              <FieldLabel htmlFor="edit-routine-name">Name</FieldLabel>
              <Input
                id="edit-routine-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Push day"
                maxLength={200}
                autoFocus
                aria-invalid={fieldErrors.name ? true : undefined}
                disabled={isPending}
              />
              {fieldErrors.name ? (
                <FieldError>{fieldErrors.name}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={fieldErrors.description ? true : undefined}>
              <FieldLabel htmlFor="edit-routine-description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="edit-routine-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Chest, shoulders and triceps."
                maxLength={2000}
                aria-invalid={fieldErrors.description ? true : undefined}
                disabled={isPending}
              />
              {fieldErrors.description ? (
                <FieldError>{fieldErrors.description}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={isPending} />}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending || !hasChanges}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
