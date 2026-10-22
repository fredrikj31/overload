import { z } from "zod";

const envVarsSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_MEDIA_BASE_URL: z.url(),
  // Injected at build time by Dockerfile.frontend from the semantic-release version
  VITE_APP_VERSION: z.string().min(1).optional(),
});

const envVars = envVarsSchema.safeParse(import.meta.env);
if (!envVars.success) {
  console.error("There is an error with your environment variables.");
  throw envVars.error;
}

export const config = {
  api: {
    baseUrl: envVars.data.VITE_API_BASE_URL,
  },
  media: {
    baseUrl: envVars.data.VITE_MEDIA_BASE_URL,
  },
  app: {
    version: envVars.data.VITE_APP_VERSION ?? "dev",
  },
};
