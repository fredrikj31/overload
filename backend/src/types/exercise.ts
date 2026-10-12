import {
  bodyPartSchema,
  equipmentSchema,
  exerciseSchema,
  muscleExerciseSchema,
  muscleSchema,
} from "@overload/database";
import { z } from "zod";

const BodyPartSummarySchema = bodyPartSchema.BodyPartSchema.pick({
  id: true,
  name: true,
  slug: true,
});

const EquipmentSummarySchema = equipmentSchema.EquipmentSchema.pick({
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
