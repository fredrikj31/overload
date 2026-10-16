import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { validateSession } from "../../hooks/validateSession";
import { ApiErrorSchema } from "../../types/error";
import {
  CreateRoutineBodySchema,
  CreateRoutineResponseSchema,
  ListRoutinesResponseSchema,
} from "../../types/routine";
import { createRoutineHandler } from "./handlers/createRoutine";
import { listRoutinesHandler } from "./handlers/listRoutines";

export const routineRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.get(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/routines", not "/routines/"
      onRequest: validateSession(),
      schema: {
        summary: "List routines",
        description: "Lists the routines owned by the signed-in user.",
        tags: ["routines"],
        security: [{ session: [] }],
        response: {
          "200": ListRoutinesResponseSchema.describe(
            "Returns the signed-in user's routines.",
          ),
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const routines = await listRoutinesHandler({
        database,
        userId,
      });
      return res.send({ data: routines });
    },
  );

  app.post(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/routines", not "/routines/"
      onRequest: validateSession(),
      schema: {
        summary: "Create routine",
        description: "Creates a new routine owned by the signed-in user.",
        tags: ["routines"],
        security: [{ session: [] }],
        body: CreateRoutineBodySchema,
        response: {
          "201": CreateRoutineResponseSchema.describe(
            "Returns the created routine.",
          ),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const routine = await createRoutineHandler({
        database,
        userId,
        body: req.body,
      });
      return res.status(201).send({ data: routine });
    },
  );
};
