import { routineSchema } from "@overload/database";
import { z } from "zod";

/** Request body for creating a routine. `userId` comes from the session. */
export const CreateRoutineBodySchema = routineSchema.CreateRoutineSchema.omit({
  userId: true,
});
export type CreateRoutineBody = z.infer<typeof CreateRoutineBodySchema>;

export const RoutineSchema = routineSchema.RoutineSchema.pick({
  id: true,
  name: true,
  description: true,
});
export type Routine = z.infer<typeof RoutineSchema>;

export const CreateRoutineResponseSchema = z.object({
  data: RoutineSchema,
});

export const ListRoutinesResponseSchema = z.object({
  data: z.array(RoutineSchema),
});

/** Path params for routes that address a single routine. */
export const RoutineParamsSchema = z.object({ id: z.uuid() });
export type RoutineParams = z.infer<typeof RoutineParamsSchema>;

/**
 * Request body for updating a routine. Every field is optional, but at least
 * one must be provided. `userId` comes from the session.
 */
export const UpdateRoutineBodySchema = routineSchema.UpdateRoutineSchema.omit({
  userId: true,
}).refine((body) => Object.keys(body).length > 0, {
  message: "At least one field must be provided",
});
export type UpdateRoutineBody = z.infer<typeof UpdateRoutineBodySchema>;

export const UpdateRoutineResponseSchema = z.object({
  data: RoutineSchema,
});
