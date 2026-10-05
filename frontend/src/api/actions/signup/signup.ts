import { authClient } from "../../../auth/client";

export const signup = async ({
  email,
  username,
  name,
  password,
}: {
  email: string;
  username: string;
  name: string;
  password: string;
}): Promise<void> => {
  try {
    await authClient.signUp.email({
      email,
      password,
      name,
      username,
    });
  } catch (error) {
    console.error("Failed to sign up user", error);
    throw error;
  }
};
