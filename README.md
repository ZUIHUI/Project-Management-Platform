# Project Management Platform

TypeScript、OpenAPI-first 的模組化單體專案：React/Vite 前端、Express API、Prisma 與 PostgreSQL，集中在 npm workspaces monorepo。

## 目錄

- `apps/web`：React feature modules 與 OpenAPI 生成型別。
- `apps/api`：TypeScript API，依 `domain → application → infrastructure/interfaces` 分層。
- `apps/api/openapi/openapi.yaml`：HTTP 契約唯一來源。
- `ProjectManagementAPI`：保留的 .NET 參考範例，不是目前 runtime。
- [架構基線](docs/architecture.md)
- [部署策略](DEPLOYMENT.md)

## 本機開發

需求：Node.js 20+ 與 PostgreSQL。首次啟動：

```bash
npm ci
export DATABASE_URL=postgresql://user:password@localhost:5432/project_management
npm --workspace apps/api run db:generate
npm --workspace apps/api run db:migrate:deploy
npm --workspace apps/api run db:seed
npm run dev:api
```

另一個 terminal 啟動前端：

```bash
npm run dev:web
```

- Web：`http://localhost:5173`
- API liveness：`http://localhost:3000/api/v1/health`
- API readiness（包含 PostgreSQL）：`http://localhost:3000/api/v1/health/ready`
- OpenAPI：`http://localhost:3000/api/v1/openapi.yaml`

也可在有 Docker 的環境執行 `docker compose up --build`。

## 驗證

```bash
npm --workspace apps/api run typecheck
npm --workspace apps/api run test:contract:gate
npm --workspace apps/web run check:api-generated
npm --workspace apps/web run typecheck
npm --workspace apps/web run lint
npm --workspace apps/web run build
```

Database-backed verification uses a protected runner. The database name must contain a standalone `test` marker; production mode and non-PostgreSQL URLs are rejected before Prisma runs.

```bash
NODE_ENV=test \
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_management_test \
npm --workspace apps/api run test:db
```

`test:db` 只會對通過安全檢查的隔離 test database 執行 migration deploy 與 seed，再依序執行 contract、integration、smoke tests；不會執行 reset 或 drop。

## API 與安全邊界

業務路由需要 Bearer token。伺服器不接受 `x-role`，註冊者也不能指定角色；每個受保護請求會從資料庫載入目前角色與 `tokenVersion`。Project membership 同時限制 project、issue、dashboard、activity 與 notification 資料範圍。

修改 OpenAPI 後執行 `npm run generate:api`，並提交更新後的 `apps/web/src/shared/api/schema.d.ts`。
