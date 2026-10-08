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
      // A new service worker takes over immediately and the page reloads, see src/main.tsx
      registerType: "autoUpdate",
      // The service worker is registered from src/main.tsx so we can also check for updates
      // periodically, instead of relying on the injected registerSW.js script
      injectRegister: false,
      manifest: false, // served from public/manifest.webmanifest
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/media\//], // exercise media is served by the media nginx, not the SPA
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
