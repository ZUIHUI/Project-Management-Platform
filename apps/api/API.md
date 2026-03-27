# API Documentation（Deployable Baseline）

> 目標：提供可直接部署與交接的後端基線說明，涵蓋資料庫模型、API 契約、權限邏輯、環境設定與驗收流程。

- Base URL：`http://localhost:3000/api/v1`
- OpenAPI 文件：`GET /openapi.yaml`
- 認證機制：JWT（`accessToken` + `refreshToken`）
- 權限模型：平台角色（RBAC）+ 專案範圍檢查（project scope enforcement）

---

## 1) 系統總覽與資料來源

### 1.1 Runtime 架構（目前狀態）

目前 API 層採用 **Express + in-memory store** 實作核心業務流程；同時保留 Prisma/SQLite schema 作為資料模型與遷移基準。

- API 路由與服務：`apps/api/src/domain/*`
- in-memory 資料來源：`apps/api/src/data/inMemoryDB.js`
- Prisma schema（資料結構 Source of Truth）：`apps/api/prisma/schema.prisma`

> 實務上可視為「API 行為可先跑起來 + DB schema 可逐步切換至正式資料庫（如 PostgreSQL）」。

### 1.2 回應格式（Envelope）

大部分成功回應採用：

```json
{
  "data": { "...": "..." },
  "meta": { "...": "..." }
}
```

錯誤回應（業務錯誤）常見格式：

```json
{
  "error": {
    "message": "Validation error",
    "status": 422
  }
}
```

另有少數中介層錯誤採用簡化格式（例如 `{"error":"Unauthorized: Missing token"}`），建議前端容錯同時處理 `error.message` 與 `error` 字串兩種型別。

---

## 2) 資料庫架構（Prisma Schema）

資料模型定義檔：`apps/api/prisma/schema.prisma`。

### 2.1 Model 細節與欄位說明

#### User
| 欄位 | 型別 | 條件/預設 | 說明 |
|---|---|---|---|
| id | String | PK | 使用者 ID |
| name | String | required | 顯示名稱 |
| email | String | unique | 登入帳號（唯一） |
| password | String | required | 密碼雜湊 |
| role | String | required | 平台角色（viewer/member/project_admin/org_admin/owner） |

關聯：擁有專案、專案成員、Issue assignee/reporter、留言作者、通知收件者、活動紀錄 actor。

#### Project
| 欄位 | 型別 | 條件/預設 | 說明 |
|---|---|---|---|
| id | String | PK | 專案 ID |
| key | String | unique | 專案代號（如 `CORE`） |
| name | String | required | 專案名稱 |
| description | String | required | 專案描述 |
| ownerId | String | FK -> User.id | 擁有者 |
| status | String | required | 專案狀態 |
| createdAt | DateTime | default(now()) | 建立時間 |
| updatedAt | DateTime | @updatedAt | 更新時間 |

#### ProjectMember
| 欄位 | 型別 | 條件 | 說明 |
|---|---|---|---|
| projectId | String | FK -> Project.id | 專案 |
| userId | String | FK -> User.id | 成員 |
| role | String | required | 專案內角色（viewer/member/project_admin） |

主鍵：`@@id([projectId, userId])`（同一使用者不可重複加入同一專案）。

#### Milestone
`id`, `projectId`, `name`, `dueAt?`, `status`, `createdAt`。

#### Sprint
`id`, `projectId`, `name`, `goal`, `startAt`, `endAt?`, `status`, `createdAt`。

#### Status
`id`, `name`, `order`，並透過 `Transition` 建立工作流遷移規則。

#### Transition
| 欄位 | 型別 | 說明 |
|---|---|---|
| fromStatusId | String | 起始狀態 |
| toStatusId | String | 目標狀態 |

主鍵：`@@id([fromStatusId, toStatusId])`。

#### Issue
| 欄位 | 型別 | 條件/預設 | 說明 |
|---|---|---|---|
| id | String | PK | Issue ID |
| projectId | String | FK | 所屬專案 |
| number | Int | required | 專案內流水號 |
| title | String | required | 標題 |
| description | String | required | 內容 |
| priority | String | required | 優先度 |
| assigneeId | String? | nullable FK | 指派人 |
| reporterId | String? | nullable FK | 回報人 |
| statusId | String | FK -> Status.id | 狀態 |
| dueDate | DateTime? | nullable | 到期日 |
| sprintId | String? | nullable FK | 所屬 Sprint |
| milestoneId | String? | nullable FK | 所屬 Milestone |
| createdAt | DateTime | default(now()) | 建立時間 |
| updatedAt | DateTime | @updatedAt | 更新時間 |

#### Comment
`id`, `issueId`, `authorId?`, `body`, `createdAt`。

#### Notification
`id`, `userId`, `type`, `message`, `read(default false)`, `createdAt`。

#### ActivityLog
`id`, `actorId?`, `issueId`, `action`, `before?`, `after?`, `createdAt`。

### 2.2 關聯重點（ER 摘要）

- `Project.ownerId -> User.id`
- `ProjectMember.projectId -> Project.id`
- `ProjectMember.userId -> User.id`
- `Issue.projectId -> Project.id`
- `Issue.statusId -> Status.id`
- `Issue.assigneeId / reporterId -> User.id`
- `Issue.sprintId -> Sprint.id`
- `Issue.milestoneId -> Milestone.id`
- `Comment.issueId -> Issue.id`
- `Notification.userId -> User.id`
- `ActivityLog.issueId -> Issue.id`

---

## 3) 認證與授權（JWT + RBAC + Project Scope）

### 3.1 JWT

- `POST /register` 建立帳號
- `POST /login` 取得 `accessToken`/`refreshToken`
- `POST /refresh` 以 refresh token 換新 access token

受保護路由需要：

```http
Authorization: Bearer <accessToken>
```

### 3.2 平台角色階層

由高到低：

1. `owner`
2. `org_admin`
3. `project_admin`
4. `member`
5. `viewer`

### 3.3 Project Scope 規則

`requireProjectScope` 會依模式檢查使用者是否可存取該 project：

- `mode: read`：viewer 以上可讀
- `mode: write`：member 以上可寫
- `mode: admin`：project_admin 以上可管理

且 `owner` / `org_admin` 具跨專案管理權。

---

## 4) API 路由總表（含權限）

> 以下皆為 `/api/v1` 底下路徑。

### 4.1 Public

| Method | Path | 說明 |
|---|---|---|
| GET | `/health` | 服務健康檢查 |
| GET | `/openapi.yaml` | OpenAPI 文件 |
| POST | `/register` | 註冊 |
| POST | `/login` | 登入 |
| POST | `/refresh` | 更新 token |

### 4.2 Project Domain（Protected）

| Method | Path | 最低權限 | 備註 |
|---|---|---|---|
| GET | `/projects` | authenticated | 支援分頁查詢 |
| GET | `/projects/{projectId}` | project scope: read | 讀取單一專案 |
| GET | `/projects/{projectId}/timeline` | project scope: read | 專案時間軸 |
| POST | `/projects` | `project_admin` | 建立專案（`key`,`name` 必填） |
| PUT | `/projects/{projectId}` | `project_admin` + admin scope | 更新專案 |
| POST | `/projects/{projectId}/archive` | `project_admin` + admin scope | 封存專案 |
| DELETE | `/projects/{projectId}` | `project_admin` + admin scope | 刪除專案 |
| POST | `/projects/{projectId}/members` | `project_admin` + admin scope | 加入成員（`userId`,`role` 必填） |
| POST | `/projects/{projectId}/milestones` | `member` + write scope | 建立里程碑（`name` 必填） |
| POST | `/projects/{projectId}/sprints` | `member` + write scope | 建立 Sprint（`name` 必填） |

### 4.3 Issue / Workflow Domain（Protected）

| Method | Path | 最低權限 | 備註 |
|---|---|---|---|
| GET | `/workflows/statuses` | authenticated | 工作流狀態清單 |
| GET | `/projects/{projectId}/board` | scope: read | 看板資料 |
| GET | `/projects/{projectId}/issues` | scope: read | Issue 清單（可分頁/篩選） |
| POST | `/projects/{projectId}/issues` | `member` + scope: write | 建立 Issue |
| GET | `/issues/{issueId}` | scope: read(issue source) | 讀取單一 Issue |
| PATCH | `/issues/{issueId}` | `member` + scope: write | 更新 Issue |
| PATCH | `/issues/{issueId}/assignee` | `member` + scope: write | 指派負責人 |
| PATCH | `/issues/{issueId}/status` | `member` + scope: write | 狀態遷移（`statusId` 必填） |
| GET | `/issues/{issueId}/comments` | scope: read | 留言列表 |
| POST | `/issues/{issueId}/comments` | `member` + scope: write | 新增留言 |
| GET | `/issues/{issueId}/activity` | scope: read(issue source) | 單一 Issue 活動紀錄（支援 `limit`） |
| GET | `/activity-logs` | `member` | 活動紀錄 |
| GET | `/tasks` | authenticated | **Deprecated**；回傳 `Deprecation`/`Sunset` header |

### 4.4 Dashboard / Notification Domain（Protected）

| Method | Path | 最低權限 | 備註 |
|---|---|---|---|
| GET | `/dashboard` | authenticated | 統計摘要、逾期與開放 Issue |
| GET | `/notifications` | authenticated | 可用 `userId` query 篩選 |
| POST | `/notifications` | authenticated | `message` 或 `payload` 至少一個 |
| PATCH | `/notifications/{notificationId}/read` | authenticated | 標記已讀 |

---

## 5) Query / Payload 常用欄位

### 5.1 分頁查詢（常見）

`GET /projects`、`GET /projects/{projectId}/issues` 多數支援：

- `page`（預設通常為 1）
- `pageSize`（預設通常為 20）

回傳 `meta` 常見欄位：`page`, `pageSize`, `total`, `totalPages`。

### 5.2 常見驗證錯誤（422）

- 建立專案缺少 `key` 或 `name`
- 新增成員缺少 `userId` 或 `role`
- 建立里程碑/Sprint 缺少 `name`
- Issue 狀態更新缺少 `statusId`
- 建立通知時 `message` 與 `payload` 皆缺

---

## 6) 環境變數與部署建議

### 6.1 必要環境變數

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### 6.2 建議啟動流程

1. 安裝依賴：`npm ci`
2. 建立 Prisma 基線：`npm --workspace apps/api run prisma:setup`
3. （可選）載入測試資料：`npm --workspace apps/api run db:seed`
4. 啟動 API：`npm --workspace apps/api run dev`

### 6.3 正式環境建議

- 將 `datasource provider` 由 `sqlite` 切換到 `postgresql`
- 建立 migration pipeline（CI/CD）
- 導入集中式 logging、指標與追蹤（APM）
- 為 refresh token 建立撤銷（revocation）與輪替策略

---

## 7) 驗收與測試建議

- 健康檢查：`GET /api/v1/health`
- 契約檢查：`GET /api/v1/openapi.yaml`
- Smoke test：`npm --workspace apps/api test`
- Backward compatibility：`npm --workspace apps/api run test:compat`
- API contract：`npm --workspace apps/api run test:contract`

---

## 8) 其他補充（整體平台）

- 前端應用位於 `apps/web`（Vite + React + Tailwind）。
- 後端目前為可部署 baseline；若要作為正式商用版本，建議優先完成：
  1. Prisma 全面接管 runtime data source
  2. 統一錯誤格式（含 middleware 與 domain service）
  3. 補齊 OpenAPI 與實際行為的自動比對（contract test gate）
  4. 增加整合測試（auth, project scope, workflow transition）
