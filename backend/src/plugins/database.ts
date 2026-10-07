import {
  createDatabaseClient,
  DatabaseClient,
  DatabaseClientOptions,
} from "@overload/database";
import fastifyPlugin from "fastify-plugin";
import { logger } from "../logger";
import { FastifyInstance } from "fastify";

const database = async (
  fastify: FastifyInstance,
  opts: DatabaseClientOptions,
) => {
  try {
    const databaseClient = createDatabaseClient(opts);
    fastify.decorate("database", databaseClient);
  } catch (error: unknown) {
    logger.fatal(error, "Unable to connect to database");
    throw new Error("Unable to connect to database!", {
      cause: error,
    });
  }
};

export const databasePlugin = fastifyPlugin(database, {
  name: "database",
});

declare module "fastify" {
  export interface FastifyInstance {
    database: DatabaseClient;
  }
}
