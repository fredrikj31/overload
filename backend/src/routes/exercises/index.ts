import {
  BodyPartSchema,
  EquipmentSchema,
  ExerciseSchema,
  MuscleExerciseSchema,
  MuscleSchema,
} from "@overload/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
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
          "200": z
            .object({
              data: z.array(
                ExerciseSchema.pick({
                  id: true,
                  name: true,
                  instructions: true,
                  imagePath: true,
                  gifPath: true,
                  attribution: true,
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
                  muscles: z.array(
                    MuscleSchema.pick({
                      id: true,
                      name: true,
                      slug: true,
                    }).extend({
                      role: MuscleExerciseSchema.shape.role,
                    }),
                  ),
                }),
              ),
            })
            .describe("Returns all exercises."),
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
