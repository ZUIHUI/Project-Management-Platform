# API Documentation

- Base URL: `http://localhost:3000/api/v1`
- OpenAPI 文件：`GET /openapi.yaml`
- 保護機制：JWT + RBAC + project scope enforcement。

## Auth
- `POST /register`
- `POST /login`
- `POST /refresh`

## Core domains
- Project: `/projects`, `/projects/{projectId}`
- Issue: `/projects/{projectId}/issues`, `/issues/{issueId}/status`
- Workflow: `/workflows/statuses`
- Legacy compat: `/tasks`（deprecated；保留 `dueDate`）

## Date semantic migration
- Canonical field: `dueAt`
- Backward compatibility: 寫入時仍接受 `dueDate`（server 轉換為 `dueAt`）；
  舊版 `/tasks` 回傳仍提供 `dueDate`。

詳細 request/response/error 契約請以 OpenAPI 檔案為準。
