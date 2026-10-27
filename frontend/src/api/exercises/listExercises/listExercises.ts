import { z } from "zod";
import { apiClient } from "../../client";
import { BodyPart, BodyPartSchema } from "../../../types/bodyPart";
import { Equipment, EquipmentSchema } from "../../../types/equipment";
import { Exercise, ExerciseSchema } from "../../../types/exercise";
import {
  MuscleExercise,
  MuscleExerciseSchema,
} from "../../../types/muscleExercise";
import { Muscle, MuscleSchema } from "../../../types/muscle";

export const listExercises = async (): Promise<
  (Pick<
    Exercise,
    "id" | "name" | "instructions" | "imagePath" | "gifPath" | "attribution"
  > & {
    bodyPart: Pick<BodyPart, "id" | "name" | "slug"> | null;
    equipment: Pick<Equipment, "id" | "name" | "slug">;
    muscles: (Pick<Muscle, "id" | "name" | "slug"> &
      Pick<MuscleExercise, "role">)[];
  })[]
> => {
  const response = await apiClient.get<unknown>("/exercises");

  return z
    .object({
      data: z.array(
        ExerciseSchema.pick({
          id: true,
          name: true,
          instructions: true,
          imagePath: true,
          gifPath: true,
          attribution: true,
        }).extend({
          // Cardio exercises have no body region.
          bodyPart: BodyPartSchema.pick({
            id: true,
            name: true,
            slug: true,
          }).nullable(),
          equipment: EquipmentSchema.pick({
            id: true,
            name: true,
            slug: true,
          }),
          muscles: z.array(
            MuscleSchema.pick({
              id: true,
              name: true,
              slug: true,
            }).extend({
              role: MuscleExerciseSchema.shape.role,
            }),
          ),
        }),
      ),
    })
    .parse(response.data).data;
};
