import { z } from "zod";
import { apiClient } from "../../client";
import * as bodyPartSchema from "../../../types/bodyPart";
import * as equipmentSchema from "../../../types/equipment";
import * as exerciseSchema from "../../../types/exercise";
import * as muscleExerciseSchema from "../../../types/muscleExercise";
import * as muscleSchema from "../../../types/muscle";

export const listExercises = async (): Promise<
  (Pick<
    exerciseSchema.Exercise,
    "id" | "name" | "instructions" | "imagePath" | "gifPath" | "attribution"
  > & {
    bodyPart: Pick<bodyPartSchema.BodyPart, "id" | "name" | "slug"> | null;
    equipment: Pick<equipmentSchema.Equipment, "id" | "name" | "slug">;
    muscles: (Pick<muscleSchema.Muscle, "id" | "name" | "slug"> &
      Pick<muscleExerciseSchema.MuscleExercise, "role">)[];
  })[]
> => {
  const response = await apiClient.get<unknown>("/exercises");

  return z
    .object({
      data: z.array(
        exerciseSchema.ExerciseSchema.pick({
          id: true,
          name: true,
          instructions: true,
          imagePath: true,
          gifPath: true,
          attribution: true,
        }).extend({
          // Cardio exercises have no body region.
          bodyPart: bodyPartSchema.BodyPartSchema.pick({
            id: true,
            name: true,
            slug: true,
          }).nullable(),
          equipment: equipmentSchema.EquipmentSchema.pick({
            id: true,
            name: true,
            slug: true,
          }),
          muscles: z.array(
            muscleSchema.MuscleSchema.pick({
              id: true,
              name: true,
              slug: true,
            }).extend({
              role: muscleExerciseSchema.MuscleExerciseSchema.shape.role,
            }),
          ),
        }),
      ),
    })
    .parse(response.data).data;
};
