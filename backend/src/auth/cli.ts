import { config } from "../config";
import { createDatabaseClient } from "@overload/database";
import { createAuth } from "./client";

// Only used by the Better Auth CLI (auth:generate). The app registers auth via authPlugin.
export const auth = createAuth(
  createDatabaseClient({
    dbHost: config.database.host,
    dbPort: config.database.port,
    dbUser: config.database.user,
    dbPassword: config.database.password,
    dbName: config.database.name,
  }),
);
