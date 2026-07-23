FROM node:22-alpine AS build

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace apps/api --include-workspace-root

COPY apps/api apps/api
RUN npm --workspace apps/api run db:generate
RUN npm --workspace apps/api run build
RUN npm prune --omit=dev --workspace apps/api

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /workspace

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 api

COPY --from=build --chown=api:nodejs /workspace/package.json /workspace/package-lock.json ./
COPY --from=build --chown=api:nodejs /workspace/node_modules ./node_modules
COPY --from=build --chown=api:nodejs /workspace/apps/api ./apps/api

USER api
WORKDIR /workspace/apps/api
EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate:deploy && npm run start"]
