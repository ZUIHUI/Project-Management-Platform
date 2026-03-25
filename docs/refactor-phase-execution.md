# 系統重構 Phase 執行紀錄

## 狀態總覽（2026-03-25）

| Phase | 目標 | 狀態 | 已完成內容 | 下一步 |
|---|---|---|---|---|
| Phase 1 | 需求與架構定稿 | ✅ 完成 | 已有 `system-refactor-spec-zh-TW.md` 作為總規格 | 轉入實作落地 |
| Phase 2 | 基礎框架與共用能力 | 🟡 進行中 | RBAC middleware、Issue domain 路由、legacy task 相容層 | 補 OpenAPI 與 contract tests |
| Phase 3 | 核心模組重構 | 🟡 進行中 | Issue CRUD/Workflow transition、評論、活動紀錄、Dashboard 指標 | 補資料持久化與權限細化 |
| Phase 4 | 進階模組與整合 | ⏳ 未開始 | - | Sprint/Cycle、Automation、通知排程 |
| Phase 5 | 資料搬遷與切換 | ⏳ 未開始 | - | 真實資料 migration dry-run |
| Phase 6 | 驗收與優化 | ⏳ 未開始 | - | UAT、效能與安全驗收 |

## 本批次新增交付

1. 新增 API smoke test，確保核心流程可被自動驗證。
2. 新增 workflow/statuses 與 board query endpoint，支援多視圖同源資料。
3. Dashboard 前端改為 issue-centric 指標頁，對齊後端資料模型。

## 已知缺口

1. 目前資料仍為 in-memory store，尚未接入 PostgreSQL。
2. RBAC 仍為簡化版本（header role），尚未串接實際 Auth token。
3. 尚未建立 OpenAPI 與自動化契約測試。

