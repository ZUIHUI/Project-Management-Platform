import { createApp } from "./core/app.js";

// 創建 Express 應用
const app = createApp();

// Vercel serverless 函數導出
export default app;

// 本地開發時啟動服務器
if (process.env.NODE_ENV !== 'production') {
  const { PORT } = await import("./config/constants.js");
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}
