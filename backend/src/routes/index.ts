import { FastifyPluginAsync } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { authRoutes } from "./auth";
import { exerciseRoutes } from "./exercises";
import { preferenceRoutes } from "./preferences";
import { routineRoutes } from "./routines";
import { workoutRoutes } from "./workouts";

export const routes: FastifyPluginAsync = async (instance) => {
  instance.setValidatorCompiler(validatorCompiler);
  instance.setSerializerCompiler(serializerCompiler);

  instance.register(authRoutes, { prefix: "/" });
  instance.register(exerciseRoutes, { prefix: "/exercises" });
  instance.register(routineRoutes, { prefix: "/routines" });
  instance.register(preferenceRoutes, { prefix: "/preferences" });
  instance.register(workoutRoutes, { prefix: "/workouts" });

  const app = instance.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/healthcheck",
    {
      schema: {
        summary: "Healthcheck Endpoint",
        description: "Pings the server, to test the connection",
        tags: ["healthcheck"],
        response: {
          "200": z.object({ ok: z.boolean() }),
        },
      },
    },
    async (_, res) => {
      return res.send({ ok: true });
    },
  );

  app.get(
    "/docs/json", // Make it available for API docs website to fetch JSON file
    {
      schema: {
        hide: true, // Hide from API & Swagger docs (UI & JSON)
        response: {
          "200": z.any(),
        },
        summary: "Receive Swagger docs in JSON format",
        tags: ["Documentation"],
      },
    },
    async (_, res) => {
      return res.send(app.swagger());
    },
  );
};
