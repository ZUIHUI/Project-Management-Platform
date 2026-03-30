# 🚀 部署指南

本項目支持多種部署方式，選擇適合您需求的方案。

## 📋 快速開始

### 使用部署腳本（推薦）

```bash
# 使腳本可執行
chmod +x deploy.sh

# 部署到 Vercel（最簡單）
./deploy.sh vercel

# 或者部署到 Railway
./deploy.sh railway

# 或者使用 Docker
./deploy.sh docker
```

## 🎯 部署選項詳解

### 1. Vercel 部署（推薦新手）

**優點**：免費額度充足，自動 HTTPS，全局 CDN

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登錄
vercel login

# 3. 部署
vercel --prod

# 4. 設置環境變數
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

**環境變數**：
- `DATABASE_URL`: PostgreSQL 連接字符串
- `JWT_SECRET`: JWT 密鑰（至少 256 位）

### 2. Railway 部署（全功能）

**優點**：一站式解決方案，內建數據庫

1. 訪問 [Railway.app](https://railway.app)
2. 連接 GitHub 倉庫
3. 添加 PostgreSQL 數據庫
4. 設置環境變數
5. 自動部署

### 3. Docker 部署（自托管）

**優點**：完全控制，適合生產環境

```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

**服務端口**：
- 前端：http://localhost:5173
- 後端：http://localhost:3000
- 數據庫：localhost:5432

### 4. Render 部署

**優點**：簡單易用，支持多種語言

1. 訪問 [Render.com](https://render.com)
2. 創建 PostgreSQL 數據庫
3. 創建 Web Service（後端）
4. 創建 Static Site（前端）
5. 連接 GitHub 倉庫

## 🔧 環境變數配置

複製 `.env.production.example` 為 `.env.production` 或生產環境變數：

```bash
# 數據庫
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-256-bit-secret-key

# 應用
NODE_ENV=production
PORT=3000
```

## 🗄️ 數據庫設置

### 生產數據庫選項

1. **Neon.tech**（推薦，免費 PostgreSQL）
2. **Supabase**（免費額度）
3. **Railway PostgreSQL**（內建）
4. **AWS RDS**（企業級）

### 數據庫遷移

```bash
cd apps/api
npx prisma generate
npx prisma db push
npm run db:seed
```

## 🧪 測試部署

部署後測試以下功能：

```bash
# 測試 API 健康檢查
curl https://your-domain.com/api/v1/health

# 測試項目 API
curl https://your-domain.com/api/v1/projects

# 測試前端
open https://your-domain.com
```

## 📊 監控和維護

### 日誌查看

```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker-compose logs -f api
```

### 數據庫備份

```bash
# 使用 pg_dump
pg_dump $DATABASE_URL > backup.sql

# 或使用 Prisma
npx prisma db push --force-reset
```

## 💰 成本估計

| 平台 | 免費額度 | 付費方案 |
|------|---------|----------|
| Vercel | 100GB 流量 | $20/月 |
| Railway | $5 額度 | $5+/月 |
| Render | 750 小時 | $7+/月 |
| Neon | 免費 | $0-50/月 |

## 🆘 故障排除

### 常見問題

1. **數據庫連接失敗**
   - 檢查 DATABASE_URL 格式
   - 確保數據庫可訪問

2. **前端無法加載**
   - 檢查 VITE_API_URL 配置
   - 確認 CORS 設置

3. **Prisma 錯誤**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 獲取幫助

- 查看 [README.md](README.md) 了解項目詳情
- 檢查 [API 文檔](apps/api/API.md)
- 查看 [架構文檔](docs/architecture-vision.md)

---

🎉 **部署完成！** 您的項目管理平台已準備就緒。