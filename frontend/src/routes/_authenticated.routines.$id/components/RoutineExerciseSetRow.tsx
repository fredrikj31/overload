import { FocusEvent, KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Input } from "@shadcn-ui/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@shadcn-ui/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn-ui/components/ui/select";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";
import { useUpdateRoutineExerciseSet } from "../../../api/actions/updateRoutineExerciseSet/useUpdateRoutineExerciseSet";
import { ApiError } from "../../../api/errors";
import { routineExercisesQueryKey } from "../../../api/queries/routines/listRoutineExercises/useListRoutineExercises";
import { routinesQueryKey } from "../../../api/queries/routines/listRoutines/useListRoutines";
import { SetTypeDialog } from "./SetTypeDialog";

type RoutineExerciseSetRowProps = {
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

const WEIGHT_UNIT_LABELS: Record<routineExerciseSetSchema.WeightUnit, string> =
  {
    kg: "kg",
    lb: "lb",
  };

/** Blur on Enter so the field's onBlur handler saves the value. */
const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === "Enter") {
    event.preventDefault();
    event.currentTarget.blur();
  }
};

/**
 * One planned set: the type badge, then weight and reps as inputs that save
 * when they lose focus. The inputs are uncontrolled and keyed on the server
 * value, so a saved change (or a reverted invalid one) re-seeds them.
 */
export const RoutineExerciseSetRow = ({
  routineId,
  routineExerciseId,
  set,
  number,
}: RoutineExerciseSetRowProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: updateRoutineExerciseSet, isPending } =
    useUpdateRoutineExerciseSet();

  const inputId = `set-${set.id}`;

  const save = (
    body: Partial<
      Pick<
        routineExerciseSetSchema.RoutineExerciseSet,
        "type" | "reps" | "weightUnit" | "weight"
      >
    >,
  ) => {
    updateRoutineExerciseSet(
      { routineId, routineExerciseId, setId: set.id, body },
      {
        onError: (error) => {
          console.error(error);

          const message =
            error instanceof ApiError ? error.message : "Could not save set";

          toast.error(message, { position: "bottom-right" });

          if (error instanceof ApiError && error.status === 404) {
            if (error.code === "routine-not-found") {
              // The routine is gone (deleted elsewhere), so the cached list
              // is stale and there is nothing left to edit here.
              void queryClient.invalidateQueries({
                queryKey: routinesQueryKey,
              });
              void navigate("/routines");
            } else {
              // The slot or set is gone; refresh the list so it drops out.
              void queryClient.invalidateQueries({
                queryKey: routineExercisesQueryKey(routineId),
              });
            }
          }
        },
      },
    );
  };

  const handleWeightBlur = (event: FocusEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim();
    // An empty weight means bodyweight, which the backend stores as null.
    const weight = raw === "" ? null : Number(raw);

    if (weight === set.weight) return;

    const parsed = routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
      weight: true,
    }).safeParse({ weight });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid weight", {
        position: "bottom-right",
      });
      event.target.value = set.weight === null ? "" : String(set.weight);
      return;
    }

    save(parsed.data);
  };

  const handleRepsBlur = (event: FocusEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim();
    const reps = raw === "" ? undefined : Number(raw);

    if (reps === set.reps) return;

    const parsed = routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
      reps: true,
    }).safeParse({ reps });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid reps", {
        position: "bottom-right",
      });
      event.target.value = String(set.reps);
      return;
    }

    save(parsed.data);
  };

  const handleUnitChange = (
    weightUnit: routineExerciseSetSchema.WeightUnit | null,
  ) => {
    if (!weightUnit || weightUnit === set.weightUnit) return;

    save({ weightUnit });
  };

  return (
    <li className="grid grid-cols-[2.5rem_1fr_1fr] items-center gap-2 rounded-lg border p-1.5">
      <div className="flex justify-center">
        <SetTypeDialog
          routineId={routineId}
          routineExerciseId={routineExerciseId}
          set={set}
          number={number}
        />
      </div>

      <InputGroup>
        <InputGroupInput
          key={set.weight ?? "bodyweight"}
          id={`${inputId}-weight`}
          aria-label={`Set ${number} weight`}
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          defaultValue={set.weight ?? ""}
          onBlur={handleWeightBlur}
          onKeyDown={blurOnEnter}
          disabled={isPending}
          className="text-center"
        />
        <InputGroupAddon align="inline-end">
          <Select
            value={set.weightUnit}
            onValueChange={handleUnitChange}
            items={WEIGHT_UNIT_LABELS}
            disabled={isPending}
          >
            <SelectTrigger
              size="sm"
              aria-label={`Set ${number} weight unit`}
              className="h-6 border-0 bg-transparent px-1 dark:bg-transparent"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {routineExerciseSetSchema.WEIGHT_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {WEIGHT_UNIT_LABELS[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
      </InputGroup>

      <Input
        key={set.reps}
        id={`${inputId}-reps`}
        aria-label={`Set ${number} reps`}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        defaultValue={set.reps}
        onBlur={handleRepsBlur}
        onKeyDown={blurOnEnter}
        disabled={isPending}
        className="text-center"
      />
    </li>
  );
};
