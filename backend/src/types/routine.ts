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
