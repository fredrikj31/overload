import { z } from "zod";
import { RoutineSchema } from "../../actions/createRoutine/types";
import { RoutineExerciseSchema } from "../../actions/addRoutineExercise/types";

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

/**
 * A routine exercise together with the exercise it points at. Sets will be
 * nested here as a `sets` array once the backend stores them.
 */
export const RoutineExerciseListItemSchema = RoutineExerciseSchema.extend({
  exercise: ExerciseSummarySchema,
});

export const ListRoutineExercisesResponseSchema = z.object({
  data: z.array(RoutineExerciseListItemSchema),
});

export type ExerciseSummary = z.infer<typeof ExerciseSummarySchema>;
export type RoutineExerciseListItem = z.infer<
  typeof RoutineExerciseListItemSchema
>;
