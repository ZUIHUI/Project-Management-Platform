# API 契約

HTTP 契約的唯一來源是 [openapi/openapi.yaml](openapi/openapi.yaml)。前端型別由它生成，runtime route 與規格覆蓋由 contract gate 雙向比對。

```bash
npm --workspace apps/web run generate:api
npm --workspace apps/api run test:contract:gate
npm run check:contracts
```

## 執行

API 使用 PostgreSQL；不再提供 SQLite 或 JSON in-memory fallback。

```bash
DATABASE_URL=postgresql://... npm --workspace apps/api run db:migrate:deploy
DATABASE_URL=postgresql://... npm --workspace apps/api run db:seed
DATABASE_URL=postgresql://... npm --workspace apps/api run dev
```

## PostgreSQL runtime test suite

Use a dedicated database whose name contains a standalone `test` marker. The runner refuses production mode, non-PostgreSQL URLs, and database names without that marker. It applies migrations, seeds fixtures, then runs contract, authorization integration, and smoke tests on isolated ports.

```bash
NODE_ENV=test \
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_management_test \
npm --workspace apps/api run test:db
```

The runner does not drop or reset the database. Use a disposable test database so repeated local runs do not affect development or production data.

所有 `/api/v1/projects`、issue、dashboard、activity 與 notification 路由都需要 Bearer access token。公開端點只有註冊、登入、refresh、liveness、readiness 與 OpenAPI 文件。`/health` 僅檢查程序存活；部署與驗收應使用 `/health/ready`，確認 PostgreSQL 也已可服務。

授權同時檢查平台角色與 project membership。伺服器會從資料庫重新載入目前角色與 `tokenVersion`；不接受 `x-role` 或註冊 payload 指定角色。
