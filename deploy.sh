#!/bin/bash

# Project Management Platform 部署腳本
# 用法: ./deploy.sh [platform]
# 平台選項: vercel, railway, render, docker

PLATFORM=${1:-vercel}

echo "🚀 開始部署到 $PLATFORM"

case $PLATFORM in
    "vercel")
        echo "📦 部署到 Vercel + Neon PostgreSQL..."
        echo "請確保您已安裝 Vercel CLI: npm i -g vercel"

        # 檢查 Vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo "安裝 Vercel CLI..."
            npm install -g vercel
        fi

        # 登錄 Vercel
        echo "請登錄到 Vercel..."
        vercel login

        # 檢查是否已設置環境變數
        echo ""
        echo "請確保在 Vercel 中設置了以下環境變數："
        echo "- DATABASE_URL (來自 Neon PostgreSQL)"
        echo "- JWT_SECRET (隨機生成的密鑰)"
        echo ""
        echo "生成的 JWT_SECRET: 34ed8cdb52ddb86d0c15ce52d7a74574ae42cabbfcadc98ea23381354d8ca0a9"
        echo ""

        read -p "是否已設置環境變數？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "請先設置環境變數，然後重新運行此命令。"
            echo "訪問: https://vercel.com/dashboard"
            exit 1
        fi

        # 部署
        echo "開始部署..."
        vercel --prod

        echo ""
        echo "✅ Vercel 部署完成！"
        echo "請記得在生產環境中運行數據庫遷移。"
        ;;

    "railway")
        echo "🚂 部署到 Railway..."
        echo "請訪問: https://railway.app"

        echo "步驟："
        echo "1. 連接 GitHub 倉庫"
        echo "2. 設置環境變數："
        echo "   - DATABASE_URL=postgresql://..."
        echo "   - JWT_SECRET=your-secret-key"
        echo "3. Railway 會自動檢測並部署"
        ;;

    "render")
        echo "🎨 部署到 Render..."
        echo "請訪問: https://render.com"

        echo "步驟："
        echo "1. 連接 GitHub 倉庫"
        echo "2. 創建 PostgreSQL 數據庫"
        echo "3. 創建 Web Service (後端)"
        echo "4. 創建 Static Site (前端)"
        echo "5. 設置環境變數"
        ;;

    "docker")
        echo "🐳 本地 Docker 部署..."

        # 檢查 Docker
        if ! command -v docker &> /dev/null; then
            echo "❌ 請先安裝 Docker"
            exit 1
        fi

        # 啟動服務
        docker-compose up -d

        echo "✅ Docker 部署完成"
        echo "前端: http://localhost:5173"
        echo "後端: http://localhost:3000"
        ;;

    *)
        echo "❌ 不支持的平台: $PLATFORM"
        echo "支持的平台: vercel, railway, render, docker"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！請記得："
echo "1. 設置生產環境變數"
echo "2. 運行數據庫遷移: npx prisma db push"
echo "3. 種子數據（可選）: npm run db:seed"
echo "4. 測試所有功能"