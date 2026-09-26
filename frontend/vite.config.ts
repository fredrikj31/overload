import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  envDir: "../",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "build",
  },
  server: {
    host: "0.0.0.0",
  },
});
