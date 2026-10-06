import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { authSchema, Database } from "@overload/database";
import { username, openAPI } from "better-auth/plugins";
import { config } from "../config";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const createAuth = (database: Database) =>
  betterAuth({
    baseURL: config.auth.baseUrl,
    secret: config.auth.secret,
    trustedOrigins: [config.website.baseUrl],
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: {
        ...authSchema,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      requireEmailVerification: false,
    },
    plugins: [
      username(),
      openAPI({
        disableDefaultReference: true,
      }),
    ],
  });

export type Auth = ReturnType<typeof createAuth>;

const auth = async (fastify: FastifyInstance) => {
  const authClient = createAuth(fastify.database);
  fastify.decorate("auth", authClient);
};

export const authPlugin = fastifyPlugin(auth, {
  name: "auth",
  dependencies: ["database"],
});

declare module "fastify" {
  export interface FastifyInstance {
    auth: Auth;
  }
}
