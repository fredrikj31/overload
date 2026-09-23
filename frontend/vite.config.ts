import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  envDir: "../",
  plugins: [react()],
  build: {
    outDir: "build",
  },
  server: {
    host: "0.0.0.0",
  },
});
