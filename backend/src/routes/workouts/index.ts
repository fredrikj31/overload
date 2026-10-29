import { WorkoutSchema } from "@overload/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
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
};
