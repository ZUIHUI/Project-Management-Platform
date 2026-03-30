#!/bin/bash

# 部署健康檢查腳本
# 用法: ./health-check.sh [url]

API_URL=${1:-"http://localhost:3000"}
WEB_URL=${2:-"http://localhost:5173"}

echo "🔍 檢查部署健康狀態..."
echo "API URL: $API_URL"
echo "Web URL: $WEB_URL"
echo ""

# 檢查 API 健康
echo "🏥 檢查 API 健康..."
if curl -s -f "$API_URL/api/v1/health" > /dev/null 2>&1; then
    echo "✅ API 健康檢查通過"
else
    echo "❌ API 健康檢查失敗"
fi

# 檢查 API 項目端點
echo "📋 檢查 API 項目端點..."
if curl -s -f "$API_URL/api/v1/projects" > /dev/null 2>&1; then
    echo "✅ API 項目端點正常"
else
    echo "❌ API 項目端點異常"
fi

# 檢查前端
echo "🌐 檢查前端..."
if curl -s -f "$WEB_URL" > /dev/null 2>&1; then
    echo "✅ 前端可訪問"
else
    echo "❌ 前端無法訪問"
fi

echo ""
echo "🎯 健康檢查完成"
echo "提示：如果有失敗項目，請檢查日誌和環境變數配置"