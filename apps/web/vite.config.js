import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const appRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, appRoot, "");
  const repo = env.GITHUB_REPOSITORY?.split("/")[1] ?? "Project-Management-Platform";
  const isPages = env.GITHUB_ACTIONS === "true";

  return {
    root: appRoot,
    plugins: [react()],
    base: isPages ? `/${repo}/` : "/",
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
