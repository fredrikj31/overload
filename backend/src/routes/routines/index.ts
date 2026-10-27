import {
  bodyPartSchema,
  equipmentSchema,
  exerciseSchema,
  routineExerciseSchema,
  routineExerciseSetSchema,
  routineSchema,
} from "@overload/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
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
          "200": z
            .object({
              data: z.array(
                routineSchema.RoutineSchema.pick({
                  id: true,
                  name: true,
                  description: true,
                }),
              ),
            })
            .describe("Returns the signed-in user's routines."),
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
        // `userId` comes from the session; `description` may be left out.
        body: routineSchema.RoutineSchema.pick({
          name: true,
          description: true,
        }).partial({ description: true }),
        response: {
          "201": z
            .object({
              data: routineSchema.RoutineSchema.pick({
                id: true,
                name: true,
                description: true,
              }),
            })
            .describe("Returns the created routine."),
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
        params: z.object({ id: z.uuid() }),
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
        params: z.object({ id: z.uuid() }),
        // Every field is optional, but at least one must be provided.
        body: routineSchema.RoutineSchema.pick({
          name: true,
          description: true,
        })
          .partial()
          .refine((body) => Object.keys(body).length > 0, {
            message: "At least one field must be provided",
          }),
        response: {
          "200": z
            .object({
              data: routineSchema.RoutineSchema.pick({
                id: true,
                name: true,
                description: true,
              }),
            })
            .describe("Returns the updated routine."),
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
        params: z.object({ id: z.uuid() }),
        // `routineId` comes from the path and `position` is assigned by the
        // server (appended at the end).
        body: routineExerciseSchema.RoutineExerciseSchema.pick({
          exerciseId: true,
        }),
        response: {
          "201": z
            .object({
              data: routineExerciseSchema.RoutineExerciseSchema.pick({
                id: true,
                routineId: true,
                exerciseId: true,
                position: true,
              }),
            })
            .describe("Returns the created routine exercise."),
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
        params: z.object({ id: z.uuid() }),
        response: {
          "200": z
            .object({
              data: z.array(
                routineExerciseSchema.RoutineExerciseSchema.pick({
                  id: true,
                  routineId: true,
                  exerciseId: true,
                  position: true,
                }).extend({
                  // Lighter than the exercise list: no instructions, gif,
                  // attribution or muscles.
                  exercise: exerciseSchema.ExerciseSchema.pick({
                    id: true,
                    name: true,
                    imagePath: true,
                  }).extend({
                    // Nullable: cardio exercises have no body region.
                    bodyPart: bodyPartSchema.BodyPartSchema.pick({
                      id: true,
                      name: true,
                      slug: true,
                    }).nullable(),
                    equipment: equipmentSchema.EquipmentSchema.pick({
                      id: true,
                      name: true,
                      slug: true,
                    }),
                  }),
                  sets: z.array(
                    routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
                      id: true,
                      routineExerciseId: true,
                      position: true,
                      type: true,
                      reps: true,
                      weightUnit: true,
                      weight: true,
                    }),
                  ),
                }),
              ),
            })
            .describe("Returns the routine's exercises in order."),
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
        params: z.object({ id: z.uuid(), routineExerciseId: z.uuid() }),
        // `routineExerciseId` comes from the path, `position` is assigned by
        // the server (appended at the end) and `weightUnit` falls back to kg
        // when omitted.
        body: routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
          type: true,
          reps: true,
          weightUnit: true,
          weight: true,
        }).partial({ type: true, weightUnit: true, weight: true }),
        response: {
          "201": z
            .object({
              data: routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
                id: true,
                routineExerciseId: true,
                position: true,
                type: true,
                reps: true,
                weightUnit: true,
                weight: true,
              }),
            })
            .describe("Returns the created routine exercise set."),
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
        params: z.object({
          id: z.uuid(),
          routineExerciseId: z.uuid(),
          setId: z.uuid(),
        }),
        // Every field is optional, but at least one must be provided.
        // `routineExerciseId` and `position` are not editable here.
        body: routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
          type: true,
          reps: true,
          weightUnit: true,
          weight: true,
        })
          .partial()
          .refine((body) => Object.keys(body).length > 0, {
            message: "At least one field must be provided",
          }),
        response: {
          "200": z
            .object({
              data: routineExerciseSetSchema.RoutineExerciseSetSchema.pick({
                id: true,
                routineExerciseId: true,
                position: true,
                type: true,
                reps: true,
                weightUnit: true,
                weight: true,
              }),
            })
            .describe("Returns the updated routine exercise set."),
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
