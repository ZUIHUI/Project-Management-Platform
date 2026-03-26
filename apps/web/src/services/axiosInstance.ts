import axios from "axios";
import { mockAdapter } from "./mockApi";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  adapter: isDemoMode ? mockAdapter : undefined,
});

export default axiosInstance;
