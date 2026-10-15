import { z } from "zod";

// Mirrors backend/src/types/routine.ts. The frontend doesn't depend on the
// backend or database packages, so the request and response shapes are
// declared here. Keep the limits in sync with database/src/schemas/routine.ts.

export const CreateRoutineBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional(),
});

export const RoutineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

export const CreateRoutineResponseSchema = z.object({
  data: RoutineSchema,
});

export type CreateRoutineBody = z.infer<typeof CreateRoutineBodySchema>;
export type Routine = z.infer<typeof RoutineSchema>;
