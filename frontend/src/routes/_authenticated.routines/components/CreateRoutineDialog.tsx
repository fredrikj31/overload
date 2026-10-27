import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
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
import { useCreateRoutine } from "../../../api/actions/createRoutine/useCreateRoutine";
import * as routineSchema from "../../../types/routine";
import { ApiError } from "../../../api/errors";

type FieldName = "name" | "description";
type FieldErrors = Partial<Record<FieldName, string>>;

const isFieldName = (value: unknown): value is FieldName =>
  value === "name" || value === "description";

export const CreateRoutineDialog = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { mutate: createRoutine, isPending } = useCreateRoutine();

  const resetForm = () => {
    setName("");
    setDescription("");
    setFieldErrors({});
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog open while a request is in flight so the user sees
    // the outcome; closing is allowed again once it settles.
    if (!nextOpen && isPending) return;

    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = routineSchema.RoutineSchema.pick({
      name: true,
      description: true,
    })
      .partial({ description: true })
      .safeParse({
        name,
        // Send nothing for an empty description so the backend stores null.
        description: description.trim() === "" ? undefined : description,
      });

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

    createRoutine(parsed.data, {
      onSuccess: () => {
        toast.success("Routine created", { position: "bottom-right" });
        resetForm();
        setOpen(false);
      },
      onError: (error) => {
        console.error(error);

        const message =
          error instanceof ApiError
            ? error.message
            : "Could not create routine";

        toast.error(message, { position: "bottom-right" });

        if (error instanceof ApiError && error.status === 400) {
          setFieldErrors({ name: error.message });
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button size="icon" aria-label="Create routine" />}
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Create routine</DialogTitle>
            <DialogDescription>
              Give your routine a name. You can add exercises to it later.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field data-invalid={fieldErrors.name ? true : undefined}>
              <FieldLabel htmlFor="routine-name">Name</FieldLabel>
              <Input
                id="routine-name"
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
              <FieldLabel htmlFor="routine-description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="routine-description"
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
