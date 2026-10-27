import { Database, RoutineExerciseSet } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getRoutine } from "../../../services/database/queries/routine/getRoutine";
import { getRoutineExercise } from "../../../services/database/queries/routineExercise/getRoutineExercise";
import { updateRoutineExerciseSet } from "../../../services/database/queries/routineExerciseSet/updateRoutineExerciseSet";

interface UpdateRoutineExerciseSetHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string; routineExerciseId: string; setId: string };
  body: Partial<
    Pick<RoutineExerciseSet, "type" | "reps" | "weightUnit" | "weight">
  >;
}
export const updateRoutineExerciseSetHandler = async ({
  database,
  userId,
  params,
  body,
}: UpdateRoutineExerciseSetHandlerOptions): Promise<
  Pick<
    RoutineExerciseSet,
    | "id"
    | "routineExerciseId"
    | "position"
    | "type"
    | "reps"
    | "weightUnit"
    | "weight"
  >
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

  // Scoped to the routine above, so a slot from another routine (even one
  // owned by this user) is also reported as not found.
  const routineExercise = await getRoutineExercise(database, {
    id: params.routineExerciseId,
    routineId: routine.id,
  });
  if (!routineExercise) {
    throw new NotFoundError({
      code: "routine-exercise-not-found",
      message: "The routine exercise was not found",
    });
  }

  const routineExerciseSet = await updateRoutineExerciseSet(database, {
    id: params.setId,
    routineExerciseId: routineExercise.id,
    values: body,
  });
  if (!routineExerciseSet) {
    throw new NotFoundError({
      code: "routine-exercise-set-not-found",
      message: "The routine exercise set was not found",
    });
  }

  return routineExerciseSet;
};
