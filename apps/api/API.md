# API Documentation（Deployable Baseline）

> 目標：提供可以直接部署的後端基線，包含**完整資料庫模型**與**完整 API 契約入口**。

- Base URL: `http://localhost:3000/api/v1`
- OpenAPI 文件：`GET /openapi.yaml`
- 認證：JWT（access + refresh）
- 權限：RBAC + project scope enforcement

---

## 1) 資料庫架構（Source of Truth）

資料庫主結構以 Prisma schema 為主：`apps/api/prisma/schema.prisma`。

### 核心資料表/模型

- `User`
  - 使用者主檔（email 唯一、role）
  - 關聯：擁有專案、專案成員、指派/回報 issue、留言、通知、活動紀錄
- `Project`
  - 專案主檔（`key` 唯一）
  - 關聯：owner、members、milestones、sprints、issues
- `ProjectMember`
  - 專案與使用者多對多關聯
  - 複合主鍵：`(projectId, userId)`
- `Milestone`
  - 里程碑（可關聯多個 issue）
- `Sprint`
  - Sprint（可關聯多個 issue）
- `Status`
  - Issue workflow 狀態定義
- `Transition`
  - 狀態遷移規則（from -> to）
  - 複合主鍵：`(fromStatusId, toStatusId)`
- `Issue`
  - 任務/議題核心資料（priority、assignee、reporter、status、dueDate）
- `Comment`
  - Issue 留言
- `Notification`
  - 使用者通知
- `ActivityLog`
  - Issue 層級活動歷程

### 關聯重點

- `Project.ownerId -> User.id`
- `Issue.projectId -> Project.id`
- `Issue.statusId -> Status.id`
- `Issue.assigneeId/reporterId -> User.id`
- `Issue.sprintId -> Sprint.id`
- `Issue.milestoneId -> Milestone.id`

> 若要導入正式環境（如 PostgreSQL），建議在部署流程執行 `prisma generate` + migration（或 `db push` 作為 baseline）。

---

## 2) API 範圍（完整路由）

### Public

- `GET /health`
- `GET /openapi.yaml`
- `POST /register`
- `POST /login`
- `POST /refresh`

### Protected（需 Bearer Token）

#### Project Domain

- `GET /projects`
- `GET /projects/{projectId}`
- `GET /projects/{projectId}/timeline`
- `POST /projects`
- `PUT /projects/{projectId}`
- `POST /projects/{projectId}/archive`
- `DELETE /projects/{projectId}`
- `POST /projects/{projectId}/members`
- `POST /projects/{projectId}/milestones`
- `POST /projects/{projectId}/sprints`

#### Issue / Workflow Domain

- `GET /workflows/statuses`
- `GET /projects/{projectId}/board`
- `GET /projects/{projectId}/issues`
- `POST /projects/{projectId}/issues`
- `GET /issues/{issueId}`
- `PATCH /issues/{issueId}`
- `PATCH /issues/{issueId}/assignee`
- `PATCH /issues/{issueId}/status`
- `GET /issues/{issueId}/comments`
- `POST /issues/{issueId}/comments`
- `GET /activity-logs`
- `GET /tasks`（deprecated；legacy compat，含 `Deprecation`/`Sunset` header）

#### Dashboard Domain

- `GET /dashboard`

#### Notification Domain

- `GET /notifications`
- `POST /notifications`
- `PATCH /notifications/{notificationId}/read`

---

## 3) 部署最低要求（Backend）

1. 設定環境變數：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
2. 初始化資料庫：
   - `npm run prisma:setup`
   - `npm run db:seed`（可選；建立 demo / baseline data）
3. 啟動 API：
   - `npm run dev`（開發）
   - 生產建議使用 process manager（pm2/systemd/container）

---

## 4) 驗收建議

- 健康檢查：`GET /api/v1/health`
- 契約檢查：`GET /api/v1/openapi.yaml`
- Smoke test：`npm --workspace apps/api test`
- Backward compatibility：`npm --workspace apps/api run test:compat`
- API contract：`npm --workspace apps/api run test:contract`

---

## 5) 備註

- 詳細 request/response/error schema 以 OpenAPI 檔案為準。
- 若要直接對外提供「可部署產品」，建議將資料層切換為 PostgreSQL 並建立 migration pipeline（CI/CD）。
