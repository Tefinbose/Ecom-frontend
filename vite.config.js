import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverTarget = env.VITE_SERVER_URL || "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: serverTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: serverTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
