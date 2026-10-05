import { useMutation } from "@tanstack/react-query";
import { login } from "./login";

export const useLogin = () => {
  return useMutation({
    mutationFn: (account: Parameters<typeof login>[0]) => {
      return login(account);
    },
  });
};
