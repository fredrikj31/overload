import { Send } from "lucide-react";
import { LoginForm } from "./components/LoginForm";
import { Navigate } from "react-router";
import { useAuth } from "../../providers/auth";

export const LoginRoute = () => {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return null;
  }

  if (isAuthenticated && !isPending) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Send className="size-4" />
          </div>
          Relay
        </a>
        <LoginForm />
      </div>
    </div>
  );
};
