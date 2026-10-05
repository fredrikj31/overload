import { authClient } from "../../../auth/client";

export const logout = async (): Promise<void> => {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error("Failed to logout user", error);
    throw error;
  }
};
