import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In dev, /api calls go to the backend. The browser sees one origin,
    // so the login cookie just works and there are no CORS issues.
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
