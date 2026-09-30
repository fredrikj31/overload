import { config as dotEnvConfig } from "dotenv";
import { z } from "zod";

// Load .env file from root
dotEnvConfig({ path: "../.env" });

const envVarsSchema = z.object({
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().default(3000),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
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
  api: {
    host: envVars.data.API_HOST,
    port: envVars.data.API_PORT,
  },
  database: {
    host: envVars.data.DATABASE_HOST,
    port: envVars.data.DATABASE_PORT,
    user: envVars.data.DATABASE_USER,
    password: envVars.data.DATABASE_PASSWORD,
    name: envVars.data.DATABASE_NAME,
  },
};
