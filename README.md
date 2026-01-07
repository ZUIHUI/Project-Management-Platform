# Project Management Platform / 專案管理平台

## English

This repository now follows a monorepo structure with separate frontend and backend applications under the `apps/` directory.

- `apps/web` contains a React client powered by Vite and Tailwind CSS.
- `apps/api` hosts a minimal Node.js API with a `/health` endpoint.
- The legacy .NET 9 example remains under `ProjectManagementAPI` for reference.
- See [Architecture Vision](docs/architecture-vision.md) for the long-term platform direction.

### Requirements
- Node.js 18+
- (optional) .NET 9 SDK for the legacy API

### Getting Started
1. Run the frontend development server using `npm run dev:web`.
2. Start the Node.js API with `npm run dev:api` (serves `http://localhost:4000/api/v1/health`).
3. Open the web app at `http://localhost:3000`.
4. Optionally run the legacy .NET API by navigating to `ProjectManagementAPI` and running `dotnet run`.

### Build
Use `npm run build:web` to create a production build of the frontend.

---

## 中文

本倉庫採用 monorepo 結構，前後端程式碼分別位於 `apps/` 目錄下：

- `apps/web`：以 Vite、React 及 Tailwind CSS 建置的前端。
- `apps/api`：提供 `/health` 端點的 Node.js 後端。
- 舊的 .NET 9 範例仍保留於 `ProjectManagementAPI` 目錄供參考。
- 可參考 [Architecture Vision](docs/architecture-vision.md) 了解長期平台規劃。

### 需求環境
- Node.js 18 以上
- （選用）.NET 9 SDK（啟動舊版 API）

### 快速開始
1. 執行 `npm run dev:web` 啟動前端開發伺服器。
2. 執行 `npm run dev:api` 啟動 Node.js API（預設提供 `http://localhost:4000/api/v1/health`）。
3. 開啟 `http://localhost:3000` 查看前端畫面。
4. 若需啟動舊版 .NET API，請進入 `ProjectManagementAPI` 並執行 `dotnet run`。

### 建置
若需產生前端正式版本，可執行 `npm run build:web`。
