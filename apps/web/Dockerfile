# Web Dockerfile
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製源代碼
COPY . .

# 構建應用
RUN npm run build

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 更改文件所有權
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 5173

# 啟動命令
CMD ["npm", "run", "preview"]