import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Navigate } from "react-router";
import { useAuth } from "../../providers/auth";
import {
  isPreferencesNotFound,
  useGetPreferences,
} from "../../api/preferences/getPreferences/useGetPreferences";
import { QueryErrorState } from "../../components/QueryErrorState";
import { WelcomeStep } from "./components/WelcomeStep";
import { PreferencesQuestionnaire } from "./components/PreferencesQuestionnaire";

type Step = "welcome" | "questions";

/**
 * First-run flow for a signed-in user without preferences. Lives outside the
 * authenticated layout so the app shell (header, bottom nav) stays hidden
 * until onboarding is done.
 */
export const OnboardingRoute = () => {
  const { isAuthenticated, isPending, user } = useAuth();
  const preferences = useGetPreferences({ enabled: isAuthenticated });
  const [step, setStep] = useState<Step>("welcome");

  if (isPending) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (preferences.isPending) {
    return null;
  }

  // Already onboarded: there is nothing to do here.
  if (preferences.isSuccess) {
    return <Navigate to="/" replace />;
  }

  if (!isPreferencesNotFound(preferences.error)) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <QueryErrorState
          message="Could not load your settings"
          onRetry={() => void preferences.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </div>
          Overload
        </div>
        {step === "welcome" ? (
          <WelcomeStep
            name={user?.name}
            onContinue={() => setStep("questions")}
          />
        ) : (
          <PreferencesQuestionnaire />
        )}
      </div>
    </div>
  );
};
