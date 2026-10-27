import { z } from "zod";
import { RoutineSchema } from "../../actions/createRoutine/types";
import { RoutineExerciseSchema } from "../../actions/addRoutineExercise/types";
import { RoutineExerciseSetSchema } from "../../actions/addRoutineExerciseSet/types";

// Mirrors backend/src/types/routine.ts. The frontend doesn't depend on the
// backend or database packages, so the response shape is declared here. The
// routine item schema is shared with the create action.

export { RoutineSchema, type Routine } from "../../actions/createRoutine/types";

export const ListRoutinesResponseSchema = z.object({
  data: z.array(RoutineSchema),
});

// Mirrors backend/src/types/routineExercise.ts and the exercise summary in
// backend/src/types/exercise.ts. The routine exercise schema is shared with
// the add action.

export {
  RoutineExerciseSchema,
  type RoutineExercise,
} from "../../actions/addRoutineExercise/types";

const SummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

/** Lighter than `ExerciseListItem`: just what a row inside a routine needs. */
export const ExerciseSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  imagePath: z.string(),
  // Cardio exercises have no body region.
  bodyPart: SummarySchema.nullable(),
  equipment: SummarySchema,
});

// The set schema is shared with the add-set action.
export {
  RoutineExerciseSetSchema,
  type RoutineExerciseSet,
} from "../../actions/addRoutineExerciseSet/types";

/**
 * A routine exercise together with the exercise it points at and its planned
 * sets, ordered by position.
 */
export const RoutineExerciseListItemSchema = RoutineExerciseSchema.extend({
  exercise: ExerciseSummarySchema,
  sets: z.array(RoutineExerciseSetSchema),
});

export const ListRoutineExercisesResponseSchema = z.object({
  data: z.array(RoutineExerciseListItemSchema),
});

export type ExerciseSummary = z.infer<typeof ExerciseSummarySchema>;
export type RoutineExerciseListItem = z.infer<
  typeof RoutineExerciseListItemSchema
>;
