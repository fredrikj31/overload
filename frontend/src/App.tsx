import { BrowserRouter, Routes, Route } from "react-router";
import { SignupRoute } from "./routes/signup/route";
import { Toaster } from "@shadcn-ui/components/ui/sonner";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupRoute />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};
