#!/bin/bash

# 生產環境數據庫設置腳本
# 用法: ./setup-production-db.sh [database_url]

DATABASE_URL=${1:-$DATABASE_URL}

if [ -z "$DATABASE_URL" ]; then
    echo "❌ 請提供 DATABASE_URL"
    echo "用法: ./setup-production-db.sh 'postgresql://...'"
    exit 1
fi

echo "🗄️ 設置生產數據庫..."
echo "數據庫: $DATABASE_URL"

# 設置環境變數
export DATABASE_URL="$DATABASE_URL"

# 進入 API 目錄
cd apps/api

# 生成 Prisma 客戶端
echo "生成 Prisma 客戶端..."
npx prisma generate

# 推送數據庫架構
echo "推送數據庫架構..."
npx prisma db push --accept-data-loss

# 運行種子數據
echo "運行種子數據..."
npm run db:seed

echo ""
echo "✅ 生產數據庫設置完成！"
echo "您的應用現在可以使用了。"