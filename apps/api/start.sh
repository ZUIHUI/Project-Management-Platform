# Railway 部署腳本
#!/bin/bash

# 安裝依賴
npm install

# 設置 Prisma
npx prisma generate

# 運行數據庫遷移
npx prisma db push

# 種子數據（可選）
npm run db:seed

# 啟動應用
npm run dev