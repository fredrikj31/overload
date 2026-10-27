import { z } from "zod";
import { apiClient } from "../../client";
import { BodyPart, BodyPartSchema } from "../../../types/bodyPart";
import { Equipment, EquipmentSchema } from "../../../types/equipment";
import { Exercise, ExerciseSchema } from "../../../types/exercise";
import {
  RoutineExercise,
  RoutineExerciseSchema,
} from "../../../types/routineExercise";
import {
  RoutineExerciseSet,
  RoutineExerciseSetSchema,
} from "../../../types/routineExerciseSet";

/**
 * A routine's exercises in order, each with the exercise it points at and its
 * planned sets, ordered by position.
 */
export const listRoutineExercises = async (
  routineId: string,
): Promise<
  (Pick<RoutineExercise, "id" | "routineId" | "exerciseId" | "position"> & {
    exercise: Pick<Exercise, "id" | "name" | "imagePath"> & {
      bodyPart: Pick<BodyPart, "id" | "name" | "slug"> | null;
      equipment: Pick<Equipment, "id" | "name" | "slug">;
    };
    sets: Pick<
      RoutineExerciseSet,
      | "id"
      | "routineExerciseId"
      | "position"
      | "type"
      | "reps"
      | "weightUnit"
      | "weight"
    >[];
  })[]
> => {
  const response = await apiClient.get<unknown>(
    `/routines/${encodeURIComponent(routineId)}/exercises`,
  );

  return z
    .object({
      data: z.array(
        RoutineExerciseSchema.pick({
          id: true,
          routineId: true,
          exerciseId: true,
          position: true,
        }).extend({
          // Lighter than the exercise list: just what a row needs.
          exercise: ExerciseSchema.pick({
            id: true,
            name: true,
            imagePath: true,
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
          }),
          sets: z.array(
            RoutineExerciseSetSchema.pick({
              id: true,
              routineExerciseId: true,
              position: true,
              type: true,
              reps: true,
              weightUnit: true,
              weight: true,
            }),
          ),
        }),
      ),
    })
    .parse(response.data).data;
};
