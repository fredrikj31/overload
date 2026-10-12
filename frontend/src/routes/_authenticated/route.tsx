import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../providers/auth";
import { AppHeader } from "../../components/AppHeader";
import { BottomNav } from "../../components/BottomNav";

export const AuthenticatedRouteLayout = () => {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return null;
  }

  if (!isAuthenticated && !isPending) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-dvh flex-col bg-background font-sans">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
