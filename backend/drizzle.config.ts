import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
  dialect: "postgresql",
  // Globbed explicitly: a bare directory path is not searched recursively.
  schema: "./src/database/schemas/*",
  out: "./src/database/migrations",
  dbCredentials: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    ssl: false,
  },
});
