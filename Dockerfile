# 多階段 Docker 構建
FROM node:18-alpine AS base

# 安裝依賴階段
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 構建階段
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# 運行階段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 創建非root用戶
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# 複製應用文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]