import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { validateSession } from "../../hooks/validateSession";
import { ApiErrorSchema } from "../../types/error";
import { ListExercisesResponseSchema } from "../../types/exercise";
import { listExercisesHandler } from "./handlers/listExercises";

export const exerciseRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.get(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/exercises", not "/exercises/"
      onRequest: validateSession(),
      schema: {
        summary: "List exercises",
        description:
          "Lists all exercises with their body part, equipment and muscles.",
        tags: ["exercises"],
        security: [{ session: [] }],
        response: {
          "200": ListExercisesResponseSchema.describe("Returns all exercises."),
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const exercises = await listExercisesHandler({
        database,
        userId,
      });
      return res.send({ data: exercises });
    },
  );
};
