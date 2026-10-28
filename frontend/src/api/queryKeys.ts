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
};
