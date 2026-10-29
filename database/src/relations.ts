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
import { userPreference } from "./schemas/user_preference";
import { workout } from "./schemas/workout";
import { workoutExercise } from "./schemas/workout_exercise";
import { workoutExerciseSet } from "./schemas/workout_exercise_set";

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
    userPreference,
    workout,
    workoutExercise,
    workoutExerciseSet,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      routines: r.many.routine(),
      preference: r.one.userPreference(),
      workouts: r.many.workout(),
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
      workoutExercises: r.many.workoutExercise(),
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
      workouts: r.many.workout(),
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
      workoutExercises: r.many.workoutExercise(),
    },
    routineExerciseSet: {
      routineExercise: r.one.routineExercise({
        from: r.routineExerciseSet.routineExerciseId,
        to: r.routineExercise.id,
        optional: false,
      }),
    },
    userPreference: {
      user: r.one.user({
        from: r.userPreference.userId,
        to: r.user.id,
        optional: false,
      }),
    },
    workout: {
      user: r.one.user({
        from: r.workout.userId,
        to: r.user.id,
        optional: false,
      }),
      // Null for workouts started without a routine.
      routine: r.one.routine({
        from: r.workout.routineId,
        to: r.routine.id,
      }),
      workoutExercises: r.many.workoutExercise(),
    },
    workoutExercise: {
      workout: r.one.workout({
        from: r.workoutExercise.workoutId,
        to: r.workout.id,
        optional: false,
      }),
      exercise: r.one.exercise({
        from: r.workoutExercise.exerciseId,
        to: r.exercise.id,
        optional: false,
      }),
      // Null for exercises added ad hoc during the workout.
      routineExercise: r.one.routineExercise({
        from: r.workoutExercise.routineExerciseId,
        to: r.routineExercise.id,
      }),
      workoutExerciseSets: r.many.workoutExerciseSet(),
    },
    workoutExerciseSet: {
      workoutExercise: r.one.workoutExercise({
        from: r.workoutExerciseSet.workoutExerciseId,
        to: r.workoutExercise.id,
        optional: false,
      }),
    },
  }),
);
