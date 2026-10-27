import { z } from "zod";

// Mirrors database/src/schemas/routine.ts. The frontend doesn't depend on
// the database package, so the entity is declared here; keep it in sync,
// including the user-facing messages, which the forms show as-is.
// Request and response shapes are derived from it with pick / omit.

export const RoutineSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  userId: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .nullable(),
});
export type Routine = z.infer<typeof RoutineSchema>;
