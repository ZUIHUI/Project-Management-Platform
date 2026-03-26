# 系統重構 Phase 執行與 Review 紀錄（嚴格模式）

## Phase 1：需求與架構基線（完成）
- 交付：重構規格書、模組邊界、核心資料模型。
- Review：需求對應與模組邊界檢查。
- 結果：通過。

## Phase 2：後端核心重構（完成）
- 交付：`core/config/domain/data` 分層架構。
- Review：
  - 所有 mutation 經 RBAC。
  - Issue workflow transition 強制驗證。
  - Project key uniqueness 強制驗證。
- 結果：通過。

## Phase 3：功能完整化（完成）
- 交付：
  - Project：create/get/update/archive/delete、member/milestone/sprint。
  - Issue：create/get/update/assign/transition/comment/list comments。
  - Notification：list/create/mark-read。
  - Dashboard：totals/status breakdown/open/overdue。
  - Legacy facade：`/tasks` with deprecation。
- Review：API 覆蓋規格主要流程。
- 結果：通過。

## Phase 4：前端流程重構（完成）
- 交付：
  - Projects：project + milestone + sprint 操作。
  - Tasks：issue 建立與狀態流轉。
  - Dashboard：status breakdown 與核心 KPI。
- Review：頁面資料流與新 API 契約一致。
- 結果：通過。

## Phase 5：自動化驗證（完成）
- 交付：API smoke test（含 milestone/sprint/assign/mark-read）。
- Review：啟動伺服器後跑完整核心流程。
- 結果：通過。

## Phase 6：待完成（下一批）
- PostgreSQL + migration + seed。
- JWT + refresh token + policy enforcement。
- OpenAPI + contract tests + CI gate。
- E2E 測試與灰度切換策略。
