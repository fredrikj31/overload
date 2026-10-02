import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import { config } from "../config";

export const authClient = createAuthClient({
  baseURL: `${config.api.baseUrl}/auth`,
  plugins: [usernameClient()],
});
