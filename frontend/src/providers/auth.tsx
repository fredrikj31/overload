import { createContext, ReactNode, useContext, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { signup } from "../api/actions/signup/signup";
import { authClient } from "../auth/client";
import { useSignup } from "../api/actions/signup/useSignup";
import { login } from "../api/actions/login/login";
import { useLogin } from "../api/actions/login/useLogin";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthProviderValue = {
  signup: (data: Parameters<typeof signup>[0]) => void;
  login: (data: Parameters<typeof login>[0]) => void;
};

const AuthContext = createContext<AuthProviderValue | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const { mutate: signupUser } = useSignup();
  const { mutate: loginUser } = useLogin();

  // Derive directly from session on every render — no separate state,
  // no effect, no stale-render window between isPending flipping and
  // user data being available.
  const user = session?.user ?? null;
  const isAuthenticated = !!session;

  const signupAction = (data: Parameters<typeof signup>[0]) => {
    signupUser(data, {
      onError: (error) => {
        console.error(error);
        toast.error("Error signing up!", { position: "bottom-right" });
      },
      onSuccess: () => {
        toast.success("Successfully signed up!", { position: "bottom-right" });
        navigate("/login");
      },
    });
  };

  const loginAction = (data: Parameters<typeof login>[0]) => {
    loginUser(data, {
      onError: (error) => {
        console.error(error);
        toast.error("Error logging in!", { position: "bottom-right" });
      },
      onSuccess: () => {
        // Don't manually setUserSession here — authClient.useSession()
        // will re-fetch/update on its own and the derived `user` above
        // will pick it up automatically. Just navigate.
        navigate("/");
      },
    });
  };

  const value = useMemo(
    () => ({
      signup: signupAction,
      login: loginAction,
    }),
    [isAuthenticated, isPending, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthProviderValue => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return authContext;
};
