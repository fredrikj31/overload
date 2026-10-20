import { BrowserRouter, Routes, Route } from "react-router";
import { SignupRoute } from "./routes/signup/route";
import { Toaster } from "@shadcn-ui/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./providers/auth";
import { LoginRoute } from "./routes/login/route";
import { ThemeProvider } from "./providers/theme";
import { AuthenticatedRouteLayout } from "./routes/_authenticated/route";
import { IndexRoute } from "./routes/_authenticated.index/route";
import { ExercisesRoute } from "./routes/_authenticated.exercises/route";
import { ExerciseDetailRoute } from "./routes/_authenticated.exercises.$id/route";
import { RoutinesRoute } from "./routes/_authenticated.routines/route";
import { RoutineDetailRoute } from "./routes/_authenticated.routines.$id/route";

export const App = () => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="overload-theme">
          <AuthProvider>
            <Routes>
              <Route path="/signup" element={<SignupRoute />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/" element={<AuthenticatedRouteLayout />}>
                <Route index element={<IndexRoute />} />
                <Route path="exercises" element={<ExercisesRoute />} />
                <Route path="exercises/:id" element={<ExerciseDetailRoute />} />
                <Route path="routines" element={<RoutinesRoute />} />
                <Route path="routines/:id" element={<RoutineDetailRoute />} />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};
