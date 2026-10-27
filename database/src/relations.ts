import { defineRelations } from "drizzle-orm";
import * as authSchema from "./schemas/auth";
import { bodyPart } from "./schemas/bodyPart";
import { equipment } from "./schemas/equipment";
import { exercise } from "./schemas/exercise";
import { muscle } from "./schemas/muscle";
import { muscleExercise } from "./schemas/muscle_exercise";
import { routine } from "./schemas/routine";
import { routineExercise } from "./schemas/routine_exercise";
import { routineExerciseSet } from "./schemas/routine_exercise_set";

export const relations = defineRelations(
  {
    ...authSchema,
    bodyPart,
    muscle,
    equipment,
    exercise,
    muscleExercise,
    routine,
    routineExercise,
    routineExerciseSet,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      routines: r.many.routine(),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    bodyPart: {
      muscles: r.many.muscle(),
      exercises: r.many.exercise(),
    },
    muscle: {
      bodyPart: r.one.bodyPart({
        from: r.muscle.bodyPartId,
        to: r.bodyPart.id,
        optional: false,
      }),
      muscleExercises: r.many.muscleExercise(),
    },
    equipment: {
      exercises: r.many.exercise(),
    },
    exercise: {
      bodyPart: r.one.bodyPart({
        from: r.exercise.bodyPartId,
        to: r.bodyPart.id,
      }),
      equipment: r.one.equipment({
        from: r.exercise.equipmentId,
        to: r.equipment.id,
        optional: false,
      }),
      muscleExercises: r.many.muscleExercise(),
      routineExercises: r.many.routineExercise(),
    },
    muscleExercise: {
      exercise: r.one.exercise({
        from: r.muscleExercise.exerciseId,
        to: r.exercise.id,
        optional: false,
      }),
      muscle: r.one.muscle({
        from: r.muscleExercise.muscleId,
        to: r.muscle.id,
        optional: false,
      }),
    },
    routine: {
      user: r.one.user({
        from: r.routine.userId,
        to: r.user.id,
        optional: false,
      }),
      routineExercises: r.many.routineExercise(),
    },
    routineExercise: {
      routine: r.one.routine({
        from: r.routineExercise.routineId,
        to: r.routine.id,
        optional: false,
      }),
      exercise: r.one.exercise({
        from: r.routineExercise.exerciseId,
        to: r.exercise.id,
        optional: false,
      }),
      routineExerciseSets: r.many.routineExerciseSet(),
    },
    routineExerciseSet: {
      routineExercise: r.one.routineExercise({
        from: r.routineExerciseSet.routineExerciseId,
        to: r.routineExercise.id,
        optional: false,
      }),
    },
  }),
);
