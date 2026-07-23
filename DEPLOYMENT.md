# 部署策略

本專案有兩種明確拓撲。兩者共用 PostgreSQL、同一份 Prisma migration 與 OpenAPI 契約，但用途不同。

## 1. Vercel：前端與短生命週期 HTTP API

- `apps/web` 建置為靜態資產。
- `api/index.ts` 將 Express 模組化單體包成單一 Vercel Function。
- 適合 CRUD、查詢與一般互動式請求。
- `vercel.json` 將函式上限設為 30 秒；不要在此執行長工作、排程 worker、常駐 WebSocket 或 migration。
- PostgreSQL 必須是外部服務；release pipeline 先執行 `npm --workspace apps/api run db:migrate:deploy`，再部署程式。

必要環境變數：

```text
DATABASE_URL=postgresql://...
JWT_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<different-long-random-secret>
NODE_ENV=production
VITE_API_URL=https://<host>/api/v1
```

## 2. 長駐容器：API、worker 與即時連線

- `apps/api/Dockerfile` 編譯 TypeScript，runtime 啟動前執行 `prisma migrate deploy`。
- 適合未來的背景工作、WebSocket、長時間匯入匯出與可控的連線池。
- worker 應使用相同 application/domain 模組，但設成獨立 process；不拆成不同資料模型或微服務。
- 正式環境不要自動 seed。`docker-compose.yml` 只為本機示範資料執行 compiled seed。

本機（需要 Docker）：

```bash
docker compose up --build
```

- Web：`http://localhost:5173`
- API：`http://localhost:3000/api/v1`
- PostgreSQL：`localhost:5432`

部署探針與驗收腳本使用 `/api/v1/health/ready`，只有 API 與 PostgreSQL 都可用時才回 200；`/api/v1/health` 保留為不查資料庫的程序存活探針。

## Migration 規則

```bash
npm --workspace apps/api run db:migrate:dev     # 僅開發時建立 migration
npm --workspace apps/api run db:migrate:deploy  # CI/release 套用已提交 migration
npm --workspace apps/api run db:seed            # 明確要求時才灌示範資料
```

禁止在正式部署使用 `prisma db push` 或 `--force-reset`。目前的 `20260720000000_postgresql_baseline` 是新的 PostgreSQL 基線；若既有環境曾套用舊 SQLite migration 名稱，必須先盤點資料並以 `prisma migrate resolve` 建立個別遷移計畫，不可直接覆蓋。
