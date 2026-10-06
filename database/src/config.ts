import { config as dotEnvConfig } from "dotenv";
import { z } from "zod";

// Only used by drizzle-kit (drizzle.config.ts). Consumers pass their own connection options to createDatabaseClient.

// Load .env file from root
dotEnvConfig({ path: "../.env" });

const envVarsSchema = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
});

const envVars = envVarsSchema.safeParse(process.env);
if (!envVars.success) {
  console.error("There is an error with your environment variables.");
  throw envVars.error;
}

export const config = {
  database: {
    host: envVars.data.DATABASE_HOST,
    port: envVars.data.DATABASE_PORT,
    user: envVars.data.DATABASE_USER,
    password: envVars.data.DATABASE_PASSWORD,
    name: envVars.data.DATABASE_NAME,
  },
};
