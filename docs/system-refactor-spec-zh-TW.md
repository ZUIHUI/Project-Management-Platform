# 專案管理系統重構規格文件（可供 AI 直接執行）

> 版本：v0.9（初稿）
> 
> 日期：2026-03-25
> 
> 適用範圍：Project Management Platform（monorepo：`apps/web`、`apps/api`、legacy `.NET API`）

---

## 一、需求統整

### 1.1 核心目標
1. 不是單純補文件，而是建立「AI 可直接依規格分模組重構」的藍圖。
2. 解決既有系統在需求、模組、介面、資料、API、前後端架構不一致問題。
3. 形成可同時作為：
   - 重構藍圖
   - 開發依據
   - 驗收依據
4. 納入舊系統遷移策略（功能、頁面、資料、API、權限、流程）。

### 1.2 系統要解決的問題
- 專案與任務協作缺乏單一可信來源（Single Source of Truth）。
- 任務流程可追蹤性不足（誰、何時、為何變更）。
- 管理層無法快速看到進度、風險、負載。
- 產品/工程協作（issue、sprint/cycle、roadmap、文件）分散在多工具。

### 1.3 系統類型定義
本系統定位為：
**「產品開發導向的協作型專案管理系統（Hybrid：Issue Tracking + Task/Portfolio + Docs + Dashboard）」**。

---

## 二、合理預設

> 以下為合理預設（因目前輸入背景仍含 placeholder，未提供完整 As-Is 細節）。

1. 目前已有基本專案/任務 CRUD，但狀態流程與欄位定義不一致。
2. 權限以「頁面能不能看」為主，尚未落實「操作層（Action-level）」授權。
3. API 可能以頁面需求驅動，缺乏穩定的 domain 契約。
4. 前端可能已採 React，後端已有 Node API，並保留 legacy .NET API。
5. 既有資料存在命名混用（Task/Issue/Ticket、Member/User）。
6. 目標使用者至少包含：管理者、PM、工程師、設計師、跨部門協作人員。

---

## 三、既有系統問題與重構方向

| 問題類型 | 常見 As-Is 症狀 | 重構原因 | To-Be 方向 |
|---|---|---|---|
| 需求邊界模糊 | 需求文件與實作不一致、同功能多版本 | 功能無法穩定迭代 | 建立「能力地圖 + 模組契約 + 驗收條件」 |
| 模組責任不清 | Project 模組含通知/統計邏輯 | 高耦合難測試 | 採 DDD-lite 模組化（Project/WorkItem/Workflow/Notification） |
| 命名不一致 | Issue/Task/Todo 混用 | 資料與 API 映射混亂 | 建立 Ubiquitous Language 字彙表 |
| UI/UX 流程斷裂 | 建立任務後不能順暢指派/追蹤 | 使用摩擦高 | 以核心任務流程重畫 IA 與導航 |
| 權限零散 | 前端控制顯示、後端未嚴格校驗 | 安全與稽核風險 | 後端強制 RBAC + 資料範圍授權 |
| API / Schema 混亂 | 回傳結構不穩、欄位語義不明 | 前後端協作成本高 | OpenAPI 契約先行、版本化策略 |
| 前後端耦合深 | UI 直接依 DB 欄位設計 | 無法替換與演進 | 引入 DTO/Mapper/BFF（視情況） |
| 可維護性差 | 無測試或低覆蓋 | 修 bug 牽一髮動全身 | 模組測試基線 + CI gate |
| 擴充性不足 | 新增視圖需重改資料層 | 功能擴展速度慢 | 統一 Query 模型 + View Adapter |
| 技術債累積 | 舊新 API 並存無策略 | 切換風險高 | 漸進式遷移（strangler pattern） |

---

## 四、市場 Benchmark 比較表

### 4.1 產品/系統設計比較（官方資料）

| 面向 | Jira 類 | Asana 類 | monday.com 類 | ClickUp 類 | Notion Projects 類 | Linear 類 |
|---|---|---|---|---|---|---|
| 產品定位 | 工程與 issue tracking、agile 強 | 跨部門 work management、目標對齊 | 視覺化 work OS、多視圖/儀表板 | All-in-one（task+docs+chat+dashboard） | docs + database + 可塑流程 | 產品研發執行效率（issues/cycles/projects） |
| 核心階層 | Epic/Issue/Subtask + Sprint | Goal/Portfolio/Project/Task | Workspace/Board/Item | Space/Folder/List/Task + Doc | Page/Database/Task | Team/Issue/Cycle/Project/Initiative |
| 視圖能力 | Board/Backlog/Roadmap/Reports | List/Board/Calendar/Timeline/Gantt | Kanban/Timeline/Gantt/Workload/Dashboard | List/Board/Calendar/Gantt/Dashboard/Doc | Table/Board/Calendar/Timeline | List/Board + Project Timeline + Insights |
| 文件整合 | 常與 Confluence 搭配 | 任務描述/附件為主 | Workdocs + board 結合 | Docs 深度整合 Hierarchy | Docs 與資料庫原生一體 | Initiative/Project update 文件化 |
| 自動化 | Workflow automation 規則 | Rules/Workflow | Automation recipes | Automations + AI 輔助 | Database automation | Triage/AI routing（企業方案） |
| 協作與通知 | 評論、提及、工作流通知 | Inbox、提及、狀態更新 | 更新流與通知 | Task/Doc/Chat 互聯 | 頁面協作、評論、提及 | issue/project 更新 + 即時檢視 |
| 報表/洞察 | Burndown、velocity 等 | Dashboard、Portfolio dashboard | Dashboard widgets | Dashboards/Goals | Charts + database rollup | Insights（issue data analytics） |
| 權限模型 | 專案/議題權限細 | 組織/專案層級 | Workspace/board 權限 | Workspace/hierarchy 權限 | Page/DB granular permissions | Team/workspace 權限 |
| 前後端啟發 | 強 workflow 與 issue life cycle | 目標-專案-任務對齊 | View engine 與儀表板組件化 | 一體化資訊架構 | DB 為核心、視圖為投影 | 高速 issue 操作與一致互動 |

### 4.2 共通能力萃取
1. 任務為核心，所有功能圍繞 Task/Issue。
2. 多視圖是「同一資料模型的不同投影」，不是多套資料。
3. 權限分成「可見範圍 + 可操作行為」。
4. 通知、活動紀錄、報表都依賴事件流（Activity/Event）。
5. Roadmap/Timeline 依賴「日期 + 依賴關係 + 狀態」。

### 4.3 建議導入優先序
- **優先採用（MVP）**：Project、Task/Issue、Board/List、Comment、Notification、RBAC、Activity Log。
- **第二階段**：Timeline/Gantt、Sprint/Cycle、Dashboard、Automation。
- **未來擴充**：Goals/Portfolio、Docs 深度整合、AI triage/insights。
- **不建議一開始導入**：過重插件平台、複雜跨組織計費/多租戶進階隔離、過度客製 workflow engine。

### 4.4 來源（官方）
- Jira（Atlassian）：Scrum backlog/boards/roadmap 相關頁面
  - https://support.atlassian.com/jira-software-cloud/docs/use-your-scrum-backlog/
  - https://www.atlassian.com/software/jira/features/scrum-boards
- Asana：Features / Goals / Portfolios
  - https://asana.com/features
  - https://asana.com/product/goals
  - https://help.asana.com/s/article/portfolio-dashboards
- monday.com：Gantt / Dashboard / Workload
  - https://monday.com/features/gantt
  - https://monday.com/features/dashboards
  - https://support.monday.com/hc/en-us/articles/360010699760-The-Workload-View-and-Widget
- ClickUp：Features / Docs in hierarchy
  - https://clickup.com/features
  - https://help.clickup.com/hc/en-us/articles/6325161594775-Add-Docs-to-Sidebar
- Notion Projects：Projects / Timeline
  - https://www.notion.com/projects
  - https://www.notion.com/help/timelines
- Linear：Cycles / Insights / Projects
  - https://linear.app/docs/use-cycles
  - https://linear.app/docs/insights
  - https://linear.app/docs/project-templates

> 註：若官方資訊涉及方案差異（plan-dependent），實作時需再做授權與商業策略盤點。

---

## 五、建議的新系統定位與產品目標

### 5.1 系統願景
打造「以任務生命週期為核心、可追蹤、可分析、可擴充」的產品開發協作平台。

### 5.2 目標使用者
- 組織管理者（Org Admin）
- PM/PO
- Tech Lead / Engineer
- Designer / QA
- Stakeholder（唯讀或受限互動）

### 5.3 核心使用情境
1. PM 建專案 → 規劃里程碑與 sprint/cycle。
2. 成員建立/分派 task(issue) → 流轉狀態 → 評論與附件協作。
3. 管理者在 dashboard 看進度、風險、負載。

### 5.4 主要痛點與成功指標
- 痛點：資料分散、流程斷點、責任不清、報表滯後。
- KPI：
  - 任務準時完成率 +20%
  - 需求到交付 lead time -25%
  - 重工率（reopen/rollback）-30%
  - 關鍵流程操作步數 -30%

---

## 六、功能模組樹

```text
Platform
├─ Identity & Access
│  ├─ Auth
│  ├─ Session
│  └─ RBAC
├─ Organization
│  ├─ Organization
│  ├─ Team
│  └─ Member
├─ Project Domain
│  ├─ Project
│  ├─ Milestone
│  ├─ Sprint/Cycle
│  └─ Roadmap
├─ Work Item Domain
│  ├─ Task/Issue
│  ├─ Subtask
│  ├─ Status Workflow
│  ├─ Priority/Tag
│  └─ Dependency
├─ Collaboration
│  ├─ Comment/@mention
│  ├─ Attachment
│  └─ Activity Log
├─ Notification
│  ├─ In-app
│  ├─ Email
│  └─ Digest
├─ Views & Reporting
│  ├─ List/Board/Calendar/Timeline
│  ├─ Dashboard
│  └─ Insights
└─ Automation (Phase 2+)
   ├─ Rule Engine Lite
   └─ Scheduled Jobs
```

### 模組依賴（摘要）
- Work Item 依賴：Identity、Organization、Project、Workflow。
- Dashboard 依賴：Work Item、Project、Activity、Notification 事件資料。
- Notification 依賴：事件匯流排（domain events）。

### 分期
- MVP：Identity、Organization、Project、Work Item、Comment、Basic Notification、List/Board。
- Phase 2：Timeline、Sprint/Cycle、Dashboard、Automation Lite。
- Phase 3：Goal/Portfolio、Docs 深度整合、AI 輔助。

---

## 七、角色與權限矩陣

### 7.1 角色定義
- **Org Owner**：租戶/組織最高權限。
- **Org Admin**：管理成員、專案、權限策略。
- **Project Admin**：單專案設定、流程、成員管理。
- **Member**：執行任務、協作。
- **Viewer**：唯讀。

### 7.2 權限矩陣（節錄）

| 功能 | Owner | Org Admin | Project Admin | Member | Viewer |
|---|---:|---:|---:|---:|---:|
| 建立專案 | ✅ | ✅ | ⚠️(僅授權範圍) | ❌ | ❌ |
| 設定工作流 | ✅ | ✅ | ✅(專案內) | ❌ | ❌ |
| 建立/編輯任務 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 指派任務 | ✅ | ✅ | ✅ | ✅(受限) | ❌ |
| 關閉/封存專案 | ✅ | ✅ | ✅(專案內) | ❌ | ❌ |
| 查看報表 | ✅ | ✅ | ✅ | ✅(專案內) | ✅(唯讀) |
| 管理角色 | ✅ | ✅ | ❌ | ❌ | ❌ |

### 7.3 RBAC 設計建議
- Policy = `resource` + `action` + `scope`（org/team/project/own）。
- 後端強制授權，前端僅做 UX 引導。
- 支援角色模板 + 專案覆寫（避免爆炸式客製）。

---

## 八、核心資料模型

### 8.1 主要實體與關聯（摘要）

| Entity | 關鍵欄位 | 關聯 | 主要約束 |
|---|---|---|---|
| User | id, email, name, status, locale | 與 Organization/Team 多對多 | email 唯一、status enum |
| Organization | id, name, plan, timezone | 1..n Team / Project | name 非空 |
| Team | id, org_id, name | n..n User、1..n Project | org_id FK |
| Project | id, org_id, team_id, key, name, status, owner_id, start_at, due_at | 1..n Task、Milestone、Sprint | (org_id,key) 唯一 |
| TaskIssue | id, project_id, number, title, description, type, status_id, priority_id, assignee_id, reporter_id, parent_id, due_at | n..1 Project, Status, Priority；n..n Tag | (project_id,number) 唯一 |
| Status | id, workflow_id, name, category(todo/doing/done), order | 1..n TaskIssue | workflow 內 name 唯一 |
| Priority | id, org_id, code, weight | 1..n TaskIssue | code 唯一 |
| Tag | id, org_id, name, color | n..n TaskIssue | (org_id,name) 唯一 |
| Milestone | id, project_id, name, due_at, status | 1..n TaskIssue | name 非空 |
| SprintCycle | id, project_id, name, start_at, end_at, goal, status | 1..n TaskIssue | start_at < end_at |
| Comment | id, task_id, author_id, body, mentions | n..1 TaskIssue | body 非空 |
| Attachment | id, task_id, uploader_id, storage_key, mime, size | n..1 TaskIssue | size 上限策略 |
| Notification | id, user_id, type, payload, read_at | n..1 User | read 狀態索引 |
| ActivityLog | id, actor_id, entity_type, entity_id, action, before_json, after_json, at | 關聯全域 | append-only |
| PermissionRelation | id, subject_type, subject_id, role, scope_type, scope_id | 關聯 User/Team/Project | 不可重複授權 |

### 8.2 設計原則
- 全部核心表具備 `created_at/updated_at`、軟刪除策略（視需求）。
- 關鍵狀態以 enum + 配置表雙軌（可控擴充）。
- ActivityLog 與 Notification 由事件驅動寫入。

---

## 九、核心流程設計

以下以「觸發條件 / 步驟 / 例外 / 狀態變更」描述。

1. **建立專案**
   - 觸發：有 `project:create` 權限。
   - 步驟：輸入基本資料 → 選 workflow 模板 → 建立預設欄位。
   - 例外：`project.key` 重複；無 team scope。
   - 狀態：`project.status = active`。

2. **專案成員設定**
   - 觸發：Project Admin 操作成員頁。
   - 步驟：加入成員→指定角色→套用 scope。
   - 例外：跨組織成員不可加入。
   - 狀態：PermissionRelation 新增/更新。

3. **建立任務/Issue**
   - 觸發：在 Project/List/Board 建立。
   - 步驟：title 必填 → 指派/優先級/標籤 → 儲存。
   - 例外：非法狀態、無指派權。
   - 狀態：初始狀態預設 `Todo`。

4. **任務指派**
   - 觸發：變更 `assignee_id`。
   - 步驟：權限校驗→更新欄位→發送通知。
   - 例外：assignee 不在 project scope。
   - 狀態：ActivityLog 記錄 `task.assigned`。

5. **狀態流轉**
   - 觸發：拖拉看板或編輯狀態。
   - 步驟：workflow transition 驗證→更新。
   - 例外：跳轉未定義、缺必要欄位（如完成時間）。
   - 狀態：Todo→Doing→Done（可客製但需可追蹤）。

6. **留言協作**
   - 觸發：評論或 @mention。
   - 步驟：儲存 comment → 解析 mention → 通知。
   - 例外：提及不存在帳號。
   - 狀態：Notification 新增。

7. **通知提醒**
   - 觸發：assign、due、status change、mention。
   - 步驟：事件進佇列→消費者發 in-app/email。
   - 例外：發送失敗重試 + dead-letter。

8. **Dashboard/報表**
   - 觸發：進入 dashboard 或排程彙整。
   - 步驟：讀聚合資料→圖表渲染。
   - 例外：資料延遲需顯示 last sync。

9. **專案封存/結案**
   - 觸發：Project Admin 執行封存。
   - 步驟：檢查未完成高優先任務→確認封存。
   - 例外：仍有阻塞 issue 時禁止。
   - 狀態：`active -> archived/closed`。

---

## 十、介面與資訊架構

### 10.1 全站 IA
- Workspace
  - Home（My Tasks / Inbox）
  - Projects
  - Issues/Tasks
  - Views（Board/List/Timeline/Calendar）
  - Dashboard
  - Notifications
  - Settings（Org/Team/Workflow/Permissions）

### 10.2 導覽結構
- 左側全域導覽（Workspace/Team/Project）
- 上方 context bar（搜尋、快速建立、篩選）
- 右側 detail panel（任務詳情）

### 10.3 頁面樹（摘要）
- `/home`
- `/projects`
- `/projects/:projectId`
- `/projects/:projectId/issues`
- `/projects/:projectId/board`
- `/projects/:projectId/timeline`
- `/dashboard`
- `/settings/*`

### 10.4 固定資訊 vs 可自訂資訊
- 固定：id、關聯鍵、created/updated、狀態類別（todo/doing/done）。
- 可自訂：標籤、欄位顯示、看板欄位排序、dashboard widgets。

---

## 十一、前端設計架構

### 11.1 建議技術
- React + TypeScript + Vite（延續現況）
- TanStack Query（資料抓取/快取）
- Zustand/Redux Toolkit（二擇一做 domain state）
- React Hook Form + Zod（表單驗證）

### 11.2 建議目錄

```text
apps/web/src
├─ app/                  # router/layout/providers
├─ pages/                # route pages
├─ features/
│  ├─ auth/
│  ├─ project/
│  ├─ issue/
│  ├─ dashboard/
│  └─ notification/
├─ entities/             # shared domain models & adapters
├─ widgets/              # composite UI blocks
├─ shared/
│  ├─ ui/
│  ├─ lib/
│  ├─ api/
│  └─ config/
└─ tests/
```

### 11.3 原則
- Page 層不直接呼叫低階 API，透過 feature service。
- UI 元件分：presentational（純 UI）/container（含資料行為）。
- 所有 mutation 必須定義 optimistic/rollback 策略。
- 權限以 route guard + component guard 雙層控管。

---

## 十二、後端設計架構

### 12.1 建議技術
- Node.js + TypeScript（NestJS 或 Fastify + modular architecture）
- PostgreSQL + Prisma（或 TypeORM）
- Redis（快取、佇列、rate limit）

### 12.2 分層
- API Layer（Controller/DTO）
- Application Layer（Use Cases）
- Domain Layer（Entities/Domain Services）
- Infrastructure Layer（Repository、Queue、Storage）

### 12.3 API 分類
- Auth API
- Organization/Team API
- Project API
- Task/Issue API
- Workflow API
- Comment/Attachment API
- Notification API
- Dashboard Query API

### 12.4 機制建議
- 認證：JWT + Refresh Token + 可撤銷 session。
- 授權：RBAC policy middleware + row-scope check。
- 檔案：S3 compatible + presigned URL。
- 通知：event bus + queue workers。
- 排程：cron jobs（digest、逾期提醒、指標聚合）。
- 稽核：ActivityLog append-only，不可覆寫。

---

## 十三、開發框架與開發方法

1. **技術選型**：維持 monorepo，前後端 TypeScript 優先一致。
2. **前後端協作**：OpenAPI first（schema 驅動 DTO/type generation）。
3. **Git 策略**：Trunk-based + 短分支（`feat/*`, `fix/*`）。
4. **流程**：
   - 設計（Spec）→ 契約（API/Schema）→ 實作 → 測試 → 驗收。
5. **方法論**：Scrum（功能迭代）+ Kanban（維運與修復）Hybrid。
6. **測試策略**：Unit / Integration / E2E / Contract Test。
7. **文件管理**：`docs/specs/*` + ADR（Architecture Decision Record）。
8. **發版**：語義化版本 + feature flags + canary rollout。

---

## 十四、非功能需求

| 類別 | 基準要求 |
|---|---|
| 效能 | P95 API < 400ms（查詢類）；主要列表頁首屏 < 2.5s |
| 安全性 | OWASP Top 10 基線、敏感操作審計、最小權限 |
| 可用性 | 月可用性 99.9%（MVP 可先 99.5%） |
| 可維護性 | 核心模組單元測試覆蓋率 >= 70% |
| 擴充性 | 模組可獨立擴充，不破壞既有 API 契約 |
| 稽核能力 | 關鍵操作具 actor/time/before/after |
| 備份復原 | 每日快照 + PITR；RPO <= 24h、RTO <= 4h |
| 多語系 | i18n 架構先行（至少 zh-TW/en） |
| 響應式 | 支援桌面優先 + 平板可用 |
| 通知可靠性 | 失敗重試 + DLQ + 可追蹤送達狀態 |

---

## 十五、重構範圍定義

### 15.1 本次重構範圍
- 核心 domain：Project、Task/Issue、Workflow、Comment、Notification、RBAC。
- 核心視圖：List、Board、基本 Dashboard。
- API 契約標準化與資料模型重整。

### 15.2 暫不重構
- 進階 AI 功能（自動分類、智能排程）。
- 高階外部整合（Salesforce/Jira 雙向同步）。
- 複雜計費與多租戶隔離高級版。

### 15.3 必須保留能力
- 既有使用者帳號與登入流程。
- 既有任務資料可查詢（至少歷史只讀）。
- 基本專案/任務查找與篩選能力。

### 15.4 可淘汰舊設計
- 與 DB 強綁定的前端欄位。
- 無版本 API。
- 無授權檢查的管理端捷徑 API。

---

## 十六、舊系統到新系統 Mapping

> 以下先提供標準 mapping 模板，待你補上實際 As-Is 名稱後可直接套用。

### 16.1 舊功能 → 新模組

| 舊功能 | 新模組 | 處置 |
|---|---|---|
| 專案管理 | Project Domain | 沿用（重構） |
| 任務管理 | Work Item Domain | 重寫（統一 Task/Issue） |
| 留言 | Collaboration.Comment | 沿用（資料清理） |
| 檔案上傳 | Collaboration.Attachment | 重寫（物件儲存） |
| 通知 | Notification | 重寫（事件驅動） |
| 權限 | Identity.RBAC | 重寫（後端強制） |

### 16.2 舊頁面 → 新頁面

| 舊頁面 | 新頁面路由 | 處置 |
|---|---|---|
| 專案列表 | `/projects` | 沿用 UI、重構資料流 |
| 任務頁 | `/projects/:id/issues` | 重做 IA |
| 看板頁 | `/projects/:id/board` | 重寫拖放與狀態流轉 |
| 儀表板 | `/dashboard` | 重寫查詢與圖表模型 |

### 16.3 舊資料結構 → 新資料模型

| 舊欄位 | 新欄位 | 處置 |
|---|---|---|
| task_status_text | status_id | 正規化 |
| owner_name | assignee_id | 映射 user table |
| project_code | project.key | 規則檢核後沿用 |
| priority_text | priority_id | 字典映射 |

### 16.4 舊 API → 新 API

| 舊 API | 新 API | 處置 |
|---|---|---|
| `GET /tasks` | `GET /api/v1/projects/:id/issues` | 重寫 |
| `POST /task/save` | `POST /api/v1/projects/:id/issues` | 重寫 |
| `POST /task/status` | `PATCH /api/v1/issues/:id/status` | 重寫 |
| `GET /project/list` | `GET /api/v1/projects` | 沿用（版本化） |

---

## 十七、分階段重構策略

| Phase | 目標 | 產出物 | 風險 | 依賴 |
|---|---|---|---|---|
| 1 需求與架構定稿 | 凍結範圍與契約 | 規格書v1、ADR、OpenAPI草案 | 需求反覆 | 業務方確認 |
| 2 基礎框架與共用能力 | 建立可擴充骨架 | Auth/RBAC、共用元件、CI/CD | 基礎設計錯誤放大 | DevOps/Infra |
| 3 核心模組重構 | Project+Issue+Workflow 上線 | 核心 API、List/Board | 新舊並行資料不一致 | Migration script |
| 4 進階模組整合 | Timeline+Dashboard+通知優化 | 報表、聚合資料、排程 | 查詢效能 | Data index |
| 5 資料搬遷與切換 | 完成 cutover | migration report、回滾計畫 | 資料遺失風險 | 乾跑演練 |
| 6 驗收與優化 | 達標與去技術債 | UAT 報告、性能報告 | 邊界案例漏測 | QA 與監控 |

---

## 十八、AI 可直接執行的模組拆解

| 模組 | 目的 | 輸入 | 輸出 | 依賴 | 驗收標準 | 優先級 |
|---|---|---|---|---|---|---|
| 認證與登入 | 建立安全登入 | 帳密/Token | access+refresh token | User, Session | 登入/續期/登出流程完整 | P0 |
| 權限模組 | 控制可見/可操作 | user role + resource | allow/deny decision | Auth, Policy | 後端拒絕未授權請求 | P0 |
| 專案列表 | 專案總覽 | query/filter | project list | Project API | 分頁/排序/搜尋可用 | P0 |
| 專案詳情頁 | 單專案上下文 | projectId | project profile + counters | Project, Issue | 可見里程碑/成員/狀態 | P0 |
| 任務列表 CRUD | 核心工作管理 | issue payload | issue entity | Issue, Workflow | 建立/更新/刪除/查詢完整 | P0 |
| 看板視圖 | 流程可視化 | status lanes + issues | DnD status update | Issue API | 拖放後狀態正確且可追蹤 | P1 |
| 評論與附件 | 協作留痕 | comment/file | comment record/file meta | Storage, Notification | @mention 可通知 | P1 |
| 通知模組 | 事件推送 | domain events | in-app/email notices | Queue | 重試與失敗追蹤 | P1 |
| Dashboard 模組 | 進度分析 | issue/project aggregates | charts & KPIs | Data mart/query | 指標可核對、延遲可接受 | P2 |
| Sprint/Cycle 模組 | 節奏管理 | cycle config | scoped issue set | Issue, Project | cycle 關聯與報表正確 | P2 |
| API Gateway/BFF | 統一前端介面 | downstream APIs | normalized response | Auth, Services | 前端依賴減少 | P2 |
| DB schema 遷移 | 新舊資料對齊 | old schema/data | new schema/data | Migration tools | 可回滾且核對一致 | P0 |

---

## 十九、驗收標準

### 19.1 功能驗收
- MVP 範圍功能全可操作（project/issue/comment/notification/rbac）。
- 任務主流程（建立→指派→流轉→完成）無斷點。

### 19.2 技術驗收
- API 全數有 OpenAPI 文件與契約測試。
- 關鍵模組測試覆蓋達標（>=70%）。

### 19.3 UI 驗收
- List/Board 互動一致，主要操作 <= 3 click 完成。
- 狀態、權限、錯誤訊息呈現一致。

### 19.4 API 驗收
- 錯誤碼標準化（401/403/404/409/422/500）。
- 分頁、排序、篩選參數規格一致。

### 19.5 測試驗收
- Unit、Integration、E2E 全綠。
- UAT 通過率 >= 95%。

### 19.6 重構完成判定
1. 新系統可獨立承載核心業務流。
2. 舊系統僅保留歷史查詢或完全退役。
3. 監控、告警、備援演練通過。

---

## 二十、AI 實作約束

1. 不可跳過既有需求對應（每個新功能需可追溯到需求/映射表）。
2. 不可只做畫面不做資料流（需含 API + state + error handling）。
3. 不可忽略權限與錯誤處理。
4. 所有模組需有明確資料契約（request/response/schema）。
5. 新舊欄位 mapping 必須落文件且可測試。
6. 每次重構先提交設計（spec diff）再提交程式碼。
7. 每次只重構一個清楚模組，避免跨模組失控。
8. 每模組必附：測試案例、回滾方案、風險點。

---

## 二十一、風險與待確認問題

### 21.1 主要風險
1. 既有資料品質不足（空值、錯誤狀態、重複資料）。
2. 新舊並行期間資料雙寫一致性風險。
3. 權限模型變更造成既有使用者行為改變。
4. Dashboard 查詢成本導致性能瓶頸。

### 21.2 待確認清單（需你補充）
1. 目前實際技術棧版本（web/api/db/infra）。
2. 既有模組清單與實際頁面路由。
3. 必保留流程（法遵/內控/稽核）細節。
4. 資料量級（專案數、任務數、日活、峰值）。
5. 外部整合清單（Slack/Email/SSO/Calendar/Git）。
6. 切換窗口限制（是否可停機、可接受 downtime）。

---

## 附錄 A：AI 重構任務模板（建議直接複用）

```md
# Module Refactor Task - <module_name>

## Goal

## In Scope / Out of Scope

## Input Contract

## Output Contract

## DB Changes

## API Changes

## UI Changes

## Test Cases

## Rollback Plan

## Acceptance Checklist
```

