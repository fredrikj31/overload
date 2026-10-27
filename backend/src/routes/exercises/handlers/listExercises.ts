import {
  bodyPartSchema,
  Database,
  equipmentSchema,
  exerciseSchema,
  muscleExerciseSchema,
  muscleSchema,
} from "@overload/database";
import { UnauthorizedError } from "../../../errors/client";
import { listExercises } from "../../../services/database/queries/exercise/listExercises";

interface ListExercisesHandlerOptions {
  database: Database;
  userId: string | undefined;
}
export const listExercisesHandler = async ({
  database,
  userId,
}: ListExercisesHandlerOptions): Promise<
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
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const exercises = await listExercises(database);

  return exercises;
};
