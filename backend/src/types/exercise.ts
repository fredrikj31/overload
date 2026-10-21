import {
  bodyPartSchema,
  equipmentSchema,
  exerciseSchema,
  muscleExerciseSchema,
  muscleSchema,
} from "@overload/database";
import { z } from "zod";

export const BodyPartSummarySchema = bodyPartSchema.BodyPartSchema.pick({
  id: true,
  name: true,
  slug: true,
});

export const EquipmentSummarySchema = equipmentSchema.EquipmentSchema.pick({
  id: true,
  name: true,
  slug: true,
});

const ExerciseMuscleSchema = muscleSchema.MuscleSchema.pick({
  id: true,
  name: true,
  slug: true,
}).extend({
  role: muscleExerciseSchema.MuscleExerciseSchema.shape.role,
});

export const ExerciseListItemSchema = exerciseSchema.ExerciseSchema.pick({
  id: true,
  name: true,
  instructions: true,
  imagePath: true,
  gifPath: true,
  attribution: true,
}).extend({
  // Nullable: cardio exercises have no body region.
  bodyPart: BodyPartSummarySchema.nullable(),
  equipment: EquipmentSummarySchema,
  muscles: z.array(ExerciseMuscleSchema),
});
export type ExerciseListItem = z.infer<typeof ExerciseListItemSchema>;

export const ListExercisesResponseSchema = z.object({
  data: z.array(ExerciseListItemSchema),
});

/**
 * The exercise fields needed to render an exercise inside another resource
 * (e.g. a routine's exercise list). Deliberately lighter than
 * `ExerciseListItemSchema`: no instructions, gif, attribution or muscles.
 */
export const ExerciseSummarySchema = exerciseSchema.ExerciseSchema.pick({
  id: true,
  name: true,
  imagePath: true,
}).extend({
  // Nullable: cardio exercises have no body region.
  bodyPart: BodyPartSummarySchema.nullable(),
  equipment: EquipmentSummarySchema,
});
export type ExerciseSummary = z.infer<typeof ExerciseSummarySchema>;
