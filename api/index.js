import { createApp } from "../apps/api/src/core/app.js";

const app = createApp();

export default function handler(req, res) {
  // Vercel 會自動處理 Express 應用
  return app(req, res);
}