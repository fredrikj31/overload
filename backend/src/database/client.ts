import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";
import fastifyPlugin from "fastify-plugin";
import { logger } from "../logger";
import { FastifyInstance } from "fastify";

export interface DatabasePluginOptions {
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

export const createDatabaseClient = (opts: DatabasePluginOptions) =>
  drizzle({
    connection: {
      connectionString: `postgresql://${opts.dbUser}:${opts.dbPassword}@${opts.dbHost}:${opts.dbPort}/${opts.dbName}`,
    },
    relations,
  });

type DatabaseClient = ReturnType<typeof createDatabaseClient>;
type Transaction = Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0];
export type Database = DatabaseClient | Transaction;

const database = async (
  fastify: FastifyInstance,
  opts: DatabasePluginOptions,
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
