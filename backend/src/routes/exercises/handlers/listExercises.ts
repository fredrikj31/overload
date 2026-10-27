import {
  BodyPart,
  Database,
  Equipment,
  Exercise,
  Muscle,
  MuscleExercise,
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
    Exercise,
    "id" | "name" | "instructions" | "imagePath" | "gifPath" | "attribution"
  > & {
    bodyPart: Pick<BodyPart, "id" | "name" | "slug"> | null;
    equipment: Pick<Equipment, "id" | "name" | "slug">;
    muscles: (Pick<Muscle, "id" | "name" | "slug"> &
      Pick<MuscleExercise, "role">)[];
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
