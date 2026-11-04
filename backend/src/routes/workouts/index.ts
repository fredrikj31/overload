import {
  BodyPartSchema,
  EquipmentSchema,
  ExerciseSchema,
  WorkoutExerciseSchema,
  WorkoutExerciseSetSchema,
  WorkoutSchema,
} from "@overload/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
import { addWorkoutExerciseHandler } from "./handlers/addWorkoutExercise";
import { finishWorkoutHandler } from "./handlers/finishWorkout";
import { getWorkoutHandler } from "./handlers/getWorkout";
import { listWorkoutExercisesHandler } from "./handlers/listWorkoutExercises";
import { startWorkoutHandler } from "./handlers/startWorkout";

export const workoutRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.post(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/workouts", not "/workouts/"
      onRequest: validateSession(),
      schema: {
        summary: "Start empty workout",
        description:
          'Starts an empty workout for the signed-in user: an in-progress workout with no exercises or sets and no routine, named "Workout". Fails with 409 if the user already has a workout in progress.',
        tags: ["workouts"],
        security: [{ session: [] }],
        // No body: `userId` comes from the session, the name is fixed and
        // `startedAt` is set by the database.
        response: {
          "201": z
            .object({
              data: WorkoutSchema.pick({
                id: true,
                routineId: true,
                name: true,
                startedAt: true,
                endedAt: true,
              }),
            })
            .describe("Returns the started workout."),
          "401": ApiErrorSchema,
          "409": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const workout = await startWorkoutHandler({ database, userId });
      return res.status(201).send({ data: workout });
    },
  );

  app.get(
    "/:id",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Get workout",
        description:
          "Returns a workout owned by the signed-in user. Workouts owned by other users are reported as not found.",
        tags: ["workouts"],
        security: [{ session: [] }],
        params: z.object({ id: z.uuid() }),
        response: {
          "200": z
            .object({
              data: WorkoutSchema.pick({
                id: true,
                routineId: true,
                name: true,
                startedAt: true,
                endedAt: true,
              }),
            })
            .describe("Returns the workout."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const workout = await getWorkoutHandler({
        database,
        userId,
        params: req.params,
      });
      return res.send({ data: workout });
    },
  );

  app.post(
    "/:id/finish",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Finish workout",
        description:
          "Finishes an in-progress workout owned by the signed-in user by setting its end time to now. Workouts owned by other users are reported as not found. Fails with 409 if the workout has already ended.",
        tags: ["workouts"],
        security: [{ session: [] }],
        params: z.object({ id: z.uuid() }),
        // No body: `endedAt` is set by the server.
        response: {
          "200": z
            .object({
              data: WorkoutSchema.pick({
                id: true,
                routineId: true,
                name: true,
                startedAt: true,
                endedAt: true,
              }),
            })
            .describe("Returns the finished workout."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "409": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const workout = await finishWorkoutHandler({
        database,
        userId,
        params: req.params,
      });
      return res.send({ data: workout });
    },
  );

  app.get(
    "/:id/exercises",
    {
      onRequest: validateSession(),
      schema: {
        summary: "List workout exercises",
        description:
          "Lists the exercises in a workout owned by the signed-in user, ordered by position, each with the exercise it points at and its logged sets in order. Finished workouts are listable too. Workouts owned by other users are reported as not found.",
        tags: ["workouts"],
        security: [{ session: [] }],
        params: z.object({ id: z.uuid() }),
        response: {
          "200": z
            .object({
              data: z.array(
                WorkoutExerciseSchema.pick({
                  id: true,
                  workoutId: true,
                  exerciseId: true,
                  routineExerciseId: true,
                  position: true,
                }).extend({
                  // Lighter than the exercise list: no instructions, gif,
                  // attribution or muscles.
                  exercise: ExerciseSchema.pick({
                    id: true,
                    name: true,
                    imagePath: true,
                  }).extend({
                    // Nullable: cardio exercises have no body region.
                    bodyPart: BodyPartSchema.pick({
                      id: true,
                      name: true,
                      slug: true,
                    }).nullable(),
                    equipment: EquipmentSchema.pick({
                      id: true,
                      name: true,
                      slug: true,
                    }),
                  }),
                  sets: z.array(
                    WorkoutExerciseSetSchema.pick({
                      id: true,
                      workoutExerciseId: true,
                      position: true,
                      type: true,
                      completedAt: true,
                      reps: true,
                      weightUnit: true,
                      weight: true,
                    }),
                  ),
                }),
              ),
            })
            .describe("Returns the workout's exercises in order."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const workoutExercises = await listWorkoutExercisesHandler({
        database,
        userId,
        params: req.params,
      });
      return res.send({ data: workoutExercises });
    },
  );

  app.post(
    "/:id/exercises",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Add exercise to workout",
        description:
          "Appends an exercise to the end of an in-progress workout owned by the signed-in user. The same exercise may be added more than once. Workouts owned by other users are reported as not found. Fails with 409 if the workout has already ended.",
        tags: ["workouts"],
        security: [{ session: [] }],
        params: z.object({ id: z.uuid() }),
        // `workoutId` comes from the path, `position` is assigned by the
        // server (appended at the end) and `routineExerciseId` stays null for
        // exercises added ad hoc.
        body: WorkoutExerciseSchema.pick({
          exerciseId: true,
        }),
        response: {
          "201": z
            .object({
              data: WorkoutExerciseSchema.pick({
                id: true,
                workoutId: true,
                exerciseId: true,
                routineExerciseId: true,
                position: true,
              }),
            })
            .describe("Returns the created workout exercise."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "409": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const workoutExercise = await addWorkoutExerciseHandler({
        database,
        userId,
        params: req.params,
        body: req.body,
      });
      return res.status(201).send({ data: workoutExercise });
    },
  );
};
