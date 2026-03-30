#!/bin/bash

# Neon PostgreSQL 設置腳本
echo "🗄️ 設置 Neon PostgreSQL 數據庫..."

echo ""
echo "📋 步驟 1: 創建 Neon 帳戶"
echo "訪問: https://neon.tech"
echo "註冊免費帳戶"
echo ""

echo "📋 步驟 2: 創建新項目"
echo "1. 點擊 'Create a project'"
echo "2. 選擇 'PostgreSQL'"
echo "3. 設置項目名稱 (例如: project-management)"
echo "4. 選擇地區 (建議: AWS us-east-1)"
echo ""

echo "📋 步驟 3: 獲取連接字符串"
echo "1. 在項目儀表板中找到 'Connection string'"
echo "2. 複製 'pooled' 連接字符串"
echo "3. 它看起來像這樣:"
echo "   postgresql://username:password@hostname/dbname?sslmode=require"
echo ""

echo "📋 步驟 4: 設置環境變數"
echo "在 Vercel 中設置以下環境變數:"
echo "- DATABASE_URL: 您的 Neon 連接字符串"
echo "- JWT_SECRET: 生成一個隨機的密鑰 (至少 32 個字符)"
echo ""

echo "🔑 生成 JWT_SECRET 的方法:"
echo "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""

echo "✅ 設置完成後，運行部署命令:"
echo "./deploy.sh vercel"