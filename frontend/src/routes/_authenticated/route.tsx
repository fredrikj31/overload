import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../providers/auth";

export const AuthenticatedRouteLayout = () => {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return null;
  }

  if (!isAuthenticated && !isPending) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="relative flex h-screen overflow-hidden bg-background font-sans">
      <Outlet />
    </main>
  );
};
