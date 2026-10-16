import { z } from "zod";
import { RoutineSchema } from "../../actions/createRoutine/types";

// Mirrors backend/src/types/routine.ts. The frontend doesn't depend on the
// backend or database packages, so the response shape is declared here. The
// routine item schema is shared with the create action.

export { RoutineSchema, type Routine } from "../../actions/createRoutine/types";

export const ListRoutinesResponseSchema = z.object({
  data: z.array(RoutineSchema),
});
