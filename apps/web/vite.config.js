import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const repo = env.GITHUB_REPOSITORY?.split("/")[1] ?? "Project-Management-Platform";
  const isPages = env.GITHUB_ACTIONS === "true";

  return {
    plugins: [react()],
    base: isPages ? `/${repo}/` : "/",
  };
});
