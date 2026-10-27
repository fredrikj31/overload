import { z } from "zod";
import {
  AddRoutineExerciseSetBodySchema,
  RoutineExerciseSetSchema,
} from "../addRoutineExerciseSet/types";

// Mirrors backend/src/types/routineExerciseSet.ts. The frontend doesn't
// depend on the backend or database packages, so the request and response
// shapes are declared here.

/**
 * Every field is optional so callers can send only what changed. A `null`
 * weight means bodyweight. The backend rejects an empty body, so callers must
 * include at least one field.
 */
export const UpdateRoutineExerciseSetBodySchema =
  AddRoutineExerciseSetBodySchema.partial();

export const UpdateRoutineExerciseSetResponseSchema = z.object({
  data: RoutineExerciseSetSchema,
});

export type UpdateRoutineExerciseSetBody = z.infer<
  typeof UpdateRoutineExerciseSetBodySchema
>;
