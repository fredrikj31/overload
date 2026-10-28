import { useLayoutEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../providers/auth";
import { AppHeader } from "../../components/AppHeader";
import { BottomNav } from "../../components/BottomNav";
import { QueryErrorState } from "../../components/QueryErrorState";
import {
  isPreferencesNotFound,
  useGetPreferences,
} from "../../api/preferences/getPreferences/useGetPreferences";

export const AuthenticatedRouteLayout = () => {
  const { isAuthenticated, isPending } = useAuth();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  // Onboarding gate: a user without preferences hasn't finished onboarding.
  const preferences = useGetPreferences({ enabled: isAuthenticated });

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

  if (preferences.isPending) {
    return null;
  }

  if (preferences.isError) {
    if (isPreferencesNotFound(preferences.error)) {
      return <Navigate to="/onboarding" replace />;
    }

    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6 font-sans">
        <QueryErrorState
          message="Could not load your settings"
          onRetry={() => void preferences.refetch()}
        />
      </div>
    );
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
