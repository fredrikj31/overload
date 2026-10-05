import { BrowserRouter, Routes, Route } from "react-router";
import { SignupRoute } from "./routes/signup/route";
import { Toaster } from "@shadcn-ui/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./providers/auth";

export const App = () => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/signup" element={<SignupRoute />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};
