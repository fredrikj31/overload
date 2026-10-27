import {
  BodyPart,
  Database,
  Equipment,
  Exercise,
  RoutineExercise,
  RoutineExerciseSet,
} from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getRoutine } from "../../../services/database/queries/routine/getRoutine";
import { listRoutineExercises } from "../../../services/database/queries/routineExercise/listRoutineExercises";

interface ListRoutineExercisesHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string };
}
export const listRoutineExercisesHandler = async ({
  database,
  userId,
  params,
}: ListRoutineExercisesHandlerOptions): Promise<
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
  if (!userId) {
    throw new UnauthorizedError({
      code: "account-id-not-found-in-request",
      message: "A account id wasn't found in the request object",
    });
  }

  const routine = await getRoutine(database, { id: params.id, userId });

  // A routine owned by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given routine id exists.
  if (!routine) {
    throw new NotFoundError({
      code: "routine-not-found",
      message: "The routine was not found",
    });
  }

  const routineExercises = await listRoutineExercises(database, routine.id);

  return routineExercises;
};
