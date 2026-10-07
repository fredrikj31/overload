import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  envDir: "../",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/media\//], // exercise media is served by the assets nginx, not the SPA
      },
    }),
    tailwindcss(),
  ],
  build: {
    outDir: "build",
  },
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@shadcn-ui": path.resolve(__dirname, "./src/shadcn-ui"),
    },
  },
});
