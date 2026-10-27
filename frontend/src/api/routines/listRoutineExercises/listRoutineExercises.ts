import { z } from "zod";
import { apiClient } from "../../client";
import * as bodyPartSchema from "../../../types/bodyPart";
import * as equipmentSchema from "../../../types/equipment";
import * as exerciseSchema from "../../../types/exercise";
import * as routineExerciseSchema from "../../../types/routineExercise";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";

/**
 * A routine's exercises in order, each with the exercise it points at and its
 * planned sets, ordered by position.
 */
export const listRoutineExercises = async (
  routineId: string,
): Promise<
  (Pick<
    routineExerciseSchema.RoutineExercise,
    "id" | "routineId" | "exerciseId" | "position"
  > & {
    exercise: Pick<exerciseSchema.Exercise, "id" | "name" | "imagePath"> & {
      bodyPart: Pick<bodyPartSchema.BodyPart, "id" | "name" | "slug"> | null;
      equipment: Pick<equipmentSchema.Equipment, "id" | "name" | "slug">;
    };
    sets: Pick<
      routineExerciseSetSchema.RoutineExerciseSet,
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
        routineExerciseSchema.RoutineExerciseSchema.pick({
          id: true,
          routineId: true,
          exerciseId: true,
          position: true,
        }).extend({
          // Lighter than the exercise list: just what a row needs.
          exercise: exerciseSchema.ExerciseSchema.pick({
            id: true,
            name: true,
            imagePath: true,
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
          }),
          sets: z.array(
            routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
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
