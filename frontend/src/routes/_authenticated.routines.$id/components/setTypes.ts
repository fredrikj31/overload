import type { SetType } from "../../../api/actions/addRoutineExerciseSet/types";

/** Display copy for the set types, shared by the set row and the type dialog. */
export const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: "Normal",
  warmup: "Warm-up",
  failure: "Failure",
  dropset: "Drop set",
};

export const SET_TYPE_DESCRIPTIONS: Record<SetType, string> = {
  normal: "A regular working set.",
  warmup: "A lighter set to prepare for the working sets.",
  failure: "Taken to muscular failure, as many reps as possible.",
  dropset: "Weight reduced right after the previous set.",
};

/**
 * What the set badge shows instead of the set number for non-normal sets,
 * with a colour so the type is visible at a glance.
 */
export const SET_TYPE_MARKERS: Record<
  Exclude<SetType, "normal">,
  { letter: string; className: string }
> = {
  warmup: { letter: "W", className: "text-amber-600 dark:text-amber-400" },
  failure: { letter: "F", className: "text-red-600 dark:text-red-400" },
  dropset: { letter: "D", className: "text-violet-600 dark:text-violet-400" },
};
