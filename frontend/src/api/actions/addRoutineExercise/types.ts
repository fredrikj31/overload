import { z } from "zod";

// Mirrors backend/src/types/routineExercise.ts. The frontend doesn't depend
// on the backend or database packages, so the request and response shapes
// are declared here.

export const AddRoutineExerciseBodySchema = z.object({
  exerciseId: z.uuid(),
});

export const RoutineExerciseSchema = z.object({
  id: z.string(),
  routineId: z.string(),
  exerciseId: z.string(),
  // 0-based slot within the routine, assigned by the server.
  position: z.number().int().min(0),
});

export const AddRoutineExerciseResponseSchema = z.object({
  data: RoutineExerciseSchema,
});

export type AddRoutineExerciseBody = z.infer<
  typeof AddRoutineExerciseBodySchema
>;
export type RoutineExercise = z.infer<typeof RoutineExerciseSchema>;
