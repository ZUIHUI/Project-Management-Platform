# Vercel + Neon 部署

這個拓撲只承載靜態前端與短生命週期 HTTP API。背景 worker、常駐 WebSocket 或超過 30 秒的工作應部署到長駐容器；完整決策見 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 1. 環境變數

在 Vercel 設定：

```text
DATABASE_URL=<Neon pooled PostgreSQL URL>
JWT_SECRET=<random 32-byte or longer value>
JWT_REFRESH_SECRET=<different random 32-byte or longer value>
NODE_ENV=production
VITE_API_URL=https://<your-host>/api/v1
```

不要把 secret 寫進 Git。可在本機各執行一次下列命令產生不同值：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## 2. 先套 migration

由 release job（或受控管理環境）設定 `DATABASE_URL` 後執行：

```bash
./setup-production-db.sh
```

這只會執行 `prisma migrate deploy`，不會 reset、`db push` 或自動 seed。

## 3. 部署與驗證

```bash
./deploy.sh vercel
./health-check.sh https://<your-host> https://<your-host>
```

`/api/v1/projects` 等業務端點需要 Bearer token；公開健康檢查只使用 `/health` 與 `/openapi.yaml`。
