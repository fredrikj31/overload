import { useLayoutEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../providers/auth";
import { AppHeader } from "../../components/AppHeader";
import { BottomNav } from "../../components/BottomNav";

export const AuthenticatedRouteLayout = () => {
  const { isAuthenticated, isPending } = useAuth();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // The scroll container is this layout's <main>, which stays mounted across
  // child route changes, so its scroll offset would otherwise carry over.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  if (isPending) {
    return null;
  }

  if (!isAuthenticated && !isPending) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-dvh flex-col bg-background font-sans">
      <AppHeader />
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
