import { useMutation } from "@tanstack/react-query";
import { logout } from "./logout";

export const useLogout = () => {
  return useMutation({
    mutationFn: () => {
      return logout();
    },
  });
};
