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
import {
  AddRoutineExerciseBodySchema,
  AddRoutineExerciseResponseSchema,
  ListRoutineExercisesResponseSchema,
} from "../../types/routineExercise";
import {
  AddRoutineExerciseSetBodySchema,
  AddRoutineExerciseSetResponseSchema,
  RoutineExerciseParamsSchema,
  RoutineExerciseSetParamsSchema,
  UpdateRoutineExerciseSetBodySchema,
  UpdateRoutineExerciseSetResponseSchema,
} from "../../types/routineExerciseSet";
import { addRoutineExerciseHandler } from "./handlers/addRoutineExercise";
import { addRoutineExerciseSetHandler } from "./handlers/addRoutineExerciseSet";
import { createRoutineHandler } from "./handlers/createRoutine";
import { deleteRoutineHandler } from "./handlers/deleteRoutine";
import { listRoutinesHandler } from "./handlers/listRoutines";
import { listRoutineExercisesHandler } from "./handlers/listRoutineExercises";
import { updateRoutineHandler } from "./handlers/updateRoutine";
import { updateRoutineExerciseSetHandler } from "./handlers/updateRoutineExerciseSet";

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

  app.post(
    "/:id/exercises",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Add exercise to routine",
        description:
          "Appends an exercise to the end of a routine owned by the signed-in user. The same exercise may be added more than once. Routines owned by other users are reported as not found.",
        tags: ["routines"],
        security: [{ session: [] }],
        params: RoutineParamsSchema,
        body: AddRoutineExerciseBodySchema,
        response: {
          "201": AddRoutineExerciseResponseSchema.describe(
            "Returns the created routine exercise.",
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
      const routineExercise = await addRoutineExerciseHandler({
        database,
        userId,
        params: req.params,
        body: req.body,
      });
      return res.status(201).send({ data: routineExercise });
    },
  );

  app.get(
    "/:id/exercises",
    {
      onRequest: validateSession(),
      schema: {
        summary: "List routine exercises",
        description:
          "Lists the exercises in a routine owned by the signed-in user, ordered by position, each with the exercise it points at and its planned sets in order. Routines owned by other users are reported as not found.",
        tags: ["routines"],
        security: [{ session: [] }],
        params: RoutineParamsSchema,
        response: {
          "200": ListRoutineExercisesResponseSchema.describe(
            "Returns the routine's exercises in order.",
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
      const routineExercises = await listRoutineExercisesHandler({
        database,
        userId,
        params: req.params,
      });
      return res.send({ data: routineExercises });
    },
  );

  app.post(
    "/:id/exercises/:routineExerciseId/sets",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Add set to routine exercise",
        description:
          "Appends a planned set to the end of an exercise in a routine owned by the signed-in user. `weightUnit` defaults to kg when omitted. Routines owned by other users, and exercises that are not part of the routine, are reported as not found.",
        tags: ["routines"],
        security: [{ session: [] }],
        params: RoutineExerciseParamsSchema,
        body: AddRoutineExerciseSetBodySchema,
        response: {
          "201": AddRoutineExerciseSetResponseSchema.describe(
            "Returns the created routine exercise set.",
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
      const routineExerciseSet = await addRoutineExerciseSetHandler({
        database,
        userId,
        params: req.params,
        body: req.body,
      });
      return res.status(201).send({ data: routineExerciseSet });
    },
  );

  app.patch(
    "/:id/exercises/:routineExerciseId/sets/:setId",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Update routine exercise set",
        description:
          "Updates the type, reps, weight and/or weight unit of a planned set in a routine owned by the signed-in user. Routines owned by other users, and sets that are not part of the given exercise, are reported as not found.",
        tags: ["routines"],
        security: [{ session: [] }],
        params: RoutineExerciseSetParamsSchema,
        body: UpdateRoutineExerciseSetBodySchema,
        response: {
          "200": UpdateRoutineExerciseSetResponseSchema.describe(
            "Returns the updated routine exercise set.",
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
      const routineExerciseSet = await updateRoutineExerciseSetHandler({
        database,
        userId,
        params: req.params,
        body: req.body,
      });
      return res.send({ data: routineExerciseSet });
    },
  );
};
