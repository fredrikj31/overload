import { config as dotEnvConfig } from "dotenv";
import path from "node:path";
import { z } from "zod";

// Load .env file from root
dotEnvConfig({ path: "../.env" });

const envVarsSchema = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  // Directory the exercise media is written to (the assets volume in Docker)
  ASSETS_DIR: z.string().default("/data"),
  // Commit of https://github.com/hasaneyldrm/exercises-dataset to import. Bump this to import a newer version.
  DATASET_REF: z.string().default("7455efae41b330c265e7cd4b78dfa848e7ce5ebd"),
  // Re-import even if the current dataset ref has already been imported
  FORCE: z.stringbool().default(false),
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
  assetsDir: path.resolve(envVars.data.ASSETS_DIR),
  dataset: {
    ref: envVars.data.DATASET_REF,
    force: envVars.data.FORCE,
  },
};
