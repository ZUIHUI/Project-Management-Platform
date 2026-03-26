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
2. Start the Node.js API with `npm run dev:api` (serves `http://localhost:3000/api/v1/health`).
3. Optionally run the legacy .NET API by navigating to `ProjectManagementAPI` and running `dotnet run`.

### Build
Use `npm run build:web` to create a production build of the frontend.

### GitHub Pages Demo
The web app can be deployed to GitHub Pages via `.github/workflows/deploy-github-pages.yml`.
- Expected URL format: `https://<github-username>.github.io/Project-Management-Platform/`
- Production build runs in demo mode (`VITE_DEMO_MODE=true`) so the site works without backend hosting.
- Uses `HashRouter`, so online routes are available via `#/projects` and `#/tasks` without 404 on refresh.


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
2. 執行 `npm run dev:api` 啟動 Node.js API（預設提供 `http://localhost:3000/api/v1/health`）。
3. 若需啟動舊版 .NET API，請進入 `ProjectManagementAPI` 並執行 `dotnet run`。

### 建置
若需產生前端正式版本，可執行 `npm run build:web`。


### 如何開啟此專案（本機）
1. 安裝 Node.js 18+。
2. 在專案根目錄執行 `npm ci` 安裝所有 workspace 依賴。
3. 啟動後端 API：`npm run dev:api`（預設 `http://localhost:3000/api/v1/health`）。
4. 另開一個終端啟動前端：`npm run dev:web`。
5. 於瀏覽器開啟 Vite 顯示網址（通常是 `http://localhost:5173`）。

### 快速檢查
- API smoke test：`npm --workspace apps/api test`
- 前端建置：`npm --workspace apps/web run build`

