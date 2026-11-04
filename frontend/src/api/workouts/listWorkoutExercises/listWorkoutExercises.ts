import { z } from "zod";
import { apiClient } from "../../client";
import { BodyPart, BodyPartSchema } from "../../../types/bodyPart";
import { Equipment, EquipmentSchema } from "../../../types/equipment";
import { Exercise, ExerciseSchema } from "../../../types/exercise";
import {
  WorkoutExercise,
  WorkoutExerciseSchema,
} from "../../../types/workoutExercise";
import {
  WorkoutExerciseSet,
  WorkoutExerciseSetSchema,
} from "../../../types/workoutExerciseSet";

/**
 * A workout's exercises in order, each with the exercise it points at and its
 * logged sets, ordered by position. Works for finished workouts too. Fails
 * with 404 (`workout-not-found`) for deleted or other users' workouts.
 */
export const listWorkoutExercises = async (
  workoutId: string,
): Promise<
  (Pick<
    WorkoutExercise,
    "id" | "workoutId" | "exerciseId" | "routineExerciseId" | "position"
  > & {
    exercise: Pick<Exercise, "id" | "name" | "imagePath"> & {
      bodyPart: Pick<BodyPart, "id" | "name" | "slug"> | null;
      equipment: Pick<Equipment, "id" | "name" | "slug">;
    };
    sets: Pick<
      WorkoutExerciseSet,
      | "id"
      | "workoutExerciseId"
      | "position"
      | "type"
      | "completedAt"
      | "reps"
      | "weightUnit"
      | "weight"
    >[];
  })[]
> => {
  const response = await apiClient.get<unknown>(
    `/workouts/${encodeURIComponent(workoutId)}/exercises`,
  );

  return z
    .object({
      data: z.array(
        WorkoutExerciseSchema.pick({
          id: true,
          workoutId: true,
          exerciseId: true,
          routineExerciseId: true,
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
            WorkoutExerciseSetSchema.pick({
              id: true,
              workoutExerciseId: true,
              position: true,
              type: true,
              completedAt: true,
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
