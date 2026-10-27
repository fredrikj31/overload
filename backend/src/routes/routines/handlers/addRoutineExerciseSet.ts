import { Database, routineExerciseSetSchema } from "@overload/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getRoutine } from "../../../services/database/queries/routine/getRoutine";
import { getRoutineExercise } from "../../../services/database/queries/routineExercise/getRoutineExercise";
import { createRoutineExerciseSet } from "../../../services/database/queries/routineExerciseSet/createRoutineExerciseSet";

interface AddRoutineExerciseSetHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { id: string; routineExerciseId: string };
  body: Pick<routineExerciseSetSchema.RoutineExerciseSet, "reps"> &
    Partial<
      Pick<
        routineExerciseSetSchema.RoutineExerciseSet,
        "type" | "weightUnit" | "weight"
      >
    >;
}
export const addRoutineExerciseSetHandler = async ({
  database,
  userId,
  params,
  body,
}: AddRoutineExerciseSetHandlerOptions): Promise<
  Pick<
    routineExerciseSetSchema.RoutineExerciseSet,
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

  const routineExerciseSet = await createRoutineExerciseSet(database, {
    routineExerciseId: routineExercise.id,
    type: body.type,
    reps: body.reps,
    // TODO: fall back to the user's preferred unit once it is stored on the
    // user instead of a hard-coded kg.
    weightUnit: body.weightUnit ?? "kg",
    weight: body.weight,
  });

  return routineExerciseSet;
};
