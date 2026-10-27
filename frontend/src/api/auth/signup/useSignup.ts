import { useMutation } from "@tanstack/react-query";
import { signup } from "./signup";

export const useSignup = () => {
  return useMutation({
    mutationFn: (account: Parameters<typeof signup>[0]) => {
      return signup(account);
    },
  });
};
