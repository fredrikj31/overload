export const queryKeys = {
  exercises: {
    list: ["exercises"] as const,
  },
  routines: {
    /** Shared with `useCreateRoutine`, `useUpdateRoutine` and `useDeleteRoutine`, which update it after a mutation. */
    list: ["routines"] as const,
    /**
     * Nested under `routines.list` so invalidating the routines prefix (e.g.
     * after deleting a routine) also drops its exercises. `useAddRoutineExercise`
     * and `useAddRoutineExerciseSet` invalidate this key after a mutation.
     */
    exercises: (routineId: string) =>
      ["routines", routineId, "exercises"] as const,
  },
  preferences: {
    /**
     * The signed-in user's preferences. `AuthenticatedRouteLayout` reads it as
     * the onboarding gate (404 means "not onboarded yet") and
     * `useCreatePreferences` seeds it after a successful POST.
     */
    detail: ["preferences"] as const,
  },
  workouts: {
    /**
     * Prefix for every workout query. There is no list endpoint yet;
     * `useStartWorkout` invalidates it so a future list picks up new workouts.
     */
    list: ["workouts"] as const,
    /**
     * One workout, nested under `workouts.list`. `useStartWorkout` seeds it
     * from the POST response so the workout screen renders without a fetch.
     */
    detail: (workoutId: string) => ["workouts", workoutId] as const,
  },
};
