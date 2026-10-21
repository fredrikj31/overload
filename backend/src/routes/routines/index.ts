import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { validateSession } from "../../hooks/validateSession";
import { ApiErrorSchema } from "../../types/error";
import {
  CreateRoutineBodySchema,
  CreateRoutineResponseSchema,
  ListRoutinesResponseSchema,
  RoutineParamsSchema,
  UpdateRoutineBodySchema,
  UpdateRoutineResponseSchema,
} from "../../types/routine";
import { createRoutineHandler } from "./handlers/createRoutine";
import { deleteRoutineHandler } from "./handlers/deleteRoutine";
import { listRoutinesHandler } from "./handlers/listRoutines";
import { updateRoutineHandler } from "./handlers/updateRoutine";

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

  app.delete(
    "/:id",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Delete routine",
        description:
          "Deletes a routine owned by the signed-in user. Routines owned by other users are reported as not found.",
        tags: ["routines"],
        security: [{ session: [] }],
        params: RoutineParamsSchema,
        response: {
          "204": z.undefined().describe("The routine was deleted."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      await deleteRoutineHandler({
        database,
        userId,
        params: req.params,
      });
      return res.status(204).send(undefined);
    },
  );

  app.patch(
    "/:id",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Update routine",
        description:
          "Updates the name and/or description of a routine owned by the signed-in user. Routines owned by other users are reported as not found.",
        tags: ["routines"],
        security: [{ session: [] }],
        params: RoutineParamsSchema,
        body: UpdateRoutineBodySchema,
        response: {
          "200": UpdateRoutineResponseSchema.describe(
            "Returns the updated routine.",
          ),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const routine = await updateRoutineHandler({
        database,
        userId,
        params: req.params,
        body: req.body,
      });
      return res.send({ data: routine });
    },
  );
};
