import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./relations";

export interface DatabaseClientOptions {
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

export const createDatabaseClient = (
  opts: DatabaseClientOptions,
): NodePgDatabase<typeof relations> & { $client: Pool } =>
  drizzle({
    connection: {
      connectionString: `postgresql://${opts.dbUser}:${opts.dbPassword}@${opts.dbHost}:${opts.dbPort}/${opts.dbName}`,
    },
    relations,
  });

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
type Transaction = Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0];
export type Database = DatabaseClient | Transaction;
