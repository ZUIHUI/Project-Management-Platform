# API Documentation

## 概覽

這個 API 提供專案管理核心功能：
- 註冊 / 登入 / refresh
- 專案 CRUD
- issue flow (建立、更新責任人、狀態、留言)
- sprint + milestone
- health check

Base URL: `http://localhost:3000/api/v1`

---

## Auth

### POST /register

Request JSON
```json
{
  "name": "Owner",
  "email": "owner@example.com",
  "password": "password",
  "role": "project_admin"
}
```

Response 201:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "name": "...", "role": "..." }
}
```

---

### POST /login

Request JSON
```json
{
  "email": "pm@example.com",
  "password": "password"
}
```

Response 200: same token payload

---

### POST /refresh

Request JSON
```json
{
  "refreshToken": "..."
}
```

Response 200: 新 access token

---

## 受保護 endpoints（需 header `Authorization: Bearer <token>`）

### GET /projects

取得專案列表

### POST /projects

Request JSON
```json
{
  "key": "CORE",
  "name": "Core Rework",
  "description": "...",
  "ownerId": "user-pm"
}
```

---

### GET /projects/:projectId/board

取得專案看板

---

### POST /projects/:projectId/issues

Request JSON
```json
{
  "title": "Issue 1",
  "reporterId": "user-pm"
}
```

---

### PATCH /issues/:issueId/assignee
Request JSON
```json
{ "assigneeId": "user-dev" }
```

### PATCH /issues/:issueId/status
Request JSON
```json
{ "statusId": "doing" }
```

### POST /issues/:issueId/comments
Request JSON
```json
{ "body": "Looks good", "authorId": "user-dev" }
```

---

## Health

### GET /health

回應狀態 200
