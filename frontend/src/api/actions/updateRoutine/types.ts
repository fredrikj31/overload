import { z } from "zod";
import { RoutineSchema } from "../createRoutine/types";

// Mirrors backend/src/types/routine.ts. The frontend doesn't depend on the
// backend or database packages, so the request and response shapes are
// declared here. Keep the limits in sync with database/src/schemas/routine.ts.

/**
 * Every field is optional so callers can send only what changed. A `null`
 * description clears it. The backend rejects an empty body, so callers must
 * include at least one field.
 */
export const UpdateRoutineBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer")
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .nullable()
    .optional(),
});

export const UpdateRoutineResponseSchema = z.object({
  data: RoutineSchema,
});

export type UpdateRoutineBody = z.infer<typeof UpdateRoutineBodySchema>;
