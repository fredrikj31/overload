import { z } from "zod";

const envVarsSchema = z.object({
  VITE_API_BASE_URL: z.url(),
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
};
