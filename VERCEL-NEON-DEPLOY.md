# 🚀 Vercel + Neon PostgreSQL 快速部署指南

## 📋 完整部署流程

### 步驟 1: 設置 Neon PostgreSQL 數據庫

1. **訪問 Neon**: https://neon.tech
2. **註冊帳戶**: 使用 GitHub 或郵箱註冊
3. **創建項目**:
   - 點擊 "Create a project"
   - 項目名稱: `project-management`
   - 數據庫: PostgreSQL
   - 地區: 選擇最近的地區
4. **獲取連接字符串**:
   - 在儀表板找到 "Connection string"
   - 複製 **pooled** 連接字符串
   - 格式: `postgresql://username:password@hostname/dbname?sslmode=require`

### 步驟 2: 準備項目

```bash
# 確保所有腳本可執行
chmod +x deploy.sh setup-neon.sh setup-production-db.sh health-check.sh

# 生成 JWT 密鑰（或使用下方提供的）
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**生成的 JWT_SECRET**: `34ed8cdb52ddb86d0c15ce52d7a74574ae42cabbfcadc98ea23381354d8ca0a9`

### 步驟 3: 部署到 Vercel

```bash
# 運行部署腳本
./deploy.sh vercel
```

腳本會引導您：
1. 安裝 Vercel CLI（如果需要）
2. 登錄 Vercel 帳戶
3. 確認環境變數設置
4. 部署應用

### 步驟 4: 設置環境變數

在 Vercel 儀表板中設置環境變數：
- **DATABASE_URL**: 您的 Neon 連接字符串
- **JWT_SECRET**: `34ed8cdb52ddb86d0c15ce52d7a74574ae42cabbfcadc98ea23381354d8ca0a9`

設置位置: Vercel Dashboard → 您的項目 → Settings → Environment Variables

### 步驟 5: 數據庫遷移

部署成功後，運行數據庫設置：

```bash
# 使用您的 Neon 連接字符串
./setup-production-db.sh "postgresql://username:password@hostname/dbname?sslmode=require"
```

### 步驟 6: 驗證部署

```bash
# 檢查應用健康狀態
./health-check.sh https://your-app-name.vercel.app

# 或者手動測試
curl https://your-app-name.vercel.app/api/v1/health
```

## 🔧 故障排除

### 數據庫連接錯誤
```bash
# 檢查連接字符串格式
echo $DATABASE_URL

# 測試數據庫連接
psql "$DATABASE_URL" -c "SELECT 1;"
```

### Prisma 錯誤
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### Vercel 構建錯誤
- 檢查 `vercel.json` 配置
- 確保所有依賴都在 `package.json` 中
- 查看 Vercel 構建日誌

## 💰 成本估計

- **Neon PostgreSQL**: 免費 (0.5 GB 存儲)
- **Vercel**: 免費 (100GB 流量/月)
- **總計**: **$0/月** (個人使用)

## 🎯 下一步

部署成功後，您可以：

1. **註冊帳戶**: 訪問前端創建第一個用戶
2. **創建項目**: 開始使用專案管理功能
3. **自定義**: 修改前端樣式和功能

## 📞 獲取幫助

如果遇到問題：
1. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 詳細文檔
2. 檢查 Vercel 和 Neon 的官方文檔
3. 查看項目 [README.md](README.md)

---

🎉 **恭喜！您的專案管理平台已成功部署！**