import { z } from "zod";

// Mirrors backend/src/types/exercise.ts. The frontend doesn't depend on the
// backend or database packages, so the response shape is declared here.

const SummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const ExerciseMuscleSchema = SummarySchema.extend({
  role: z.enum(["primary", "secondary"]),
});

export const ExerciseListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  instructions: z.array(z.string()),
  imagePath: z.string(),
  gifPath: z.string(),
  attribution: z.string(),
  // Cardio exercises have no body region.
  bodyPart: SummarySchema.nullable(),
  equipment: SummarySchema,
  muscles: z.array(ExerciseMuscleSchema),
});

export const ListExercisesResponseSchema = z.object({
  data: z.array(ExerciseListItemSchema),
});

export type ExerciseMuscle = z.infer<typeof ExerciseMuscleSchema>;
export type ExerciseListItem = z.infer<typeof ExerciseListItemSchema>;
