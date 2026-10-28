import { UserPreferenceSchema } from "@overload/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
import { createPreferenceHandler } from "./handlers/createPreference";

export const preferenceRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.post(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/preferences", not "/preferences/"
      onRequest: validateSession(),
      schema: {
        summary: "Create preferences",
        description:
          "Creates the signed-in user's preferences. Fields left out take their defaults. Fails with 409 if the user already has preferences.",
        tags: ["preferences"],
        security: [{ session: [] }],
        // `userId` comes from the session; every preference may be left out
        // and then takes its database default.
        body: UserPreferenceSchema.pick({ weightUnit: true }).partial(),
        response: {
          "201": z
            .object({
              data: UserPreferenceSchema.pick({ weightUnit: true }),
            })
            .describe("Returns the created preferences."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "409": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const preference = await createPreferenceHandler({
        database,
        userId,
        body: req.body,
      });
      return res.status(201).send({ data: preference });
    },
  );
};
