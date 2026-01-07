# Architecture Vision / 架構願景

## 1. Overall Direction / 整體架構願景

### Frontend & Backend Separation + Monorepo / 前後端分離與 Monorepo 管理
- Use Turborepo or Nx to manage frontend (Web, Mobile) and backend (API, services) subprojects.
- Share packages (utilities, types, UI components) to reduce duplication and keep consistency.

### Modular Domain Services / 微服務或模組化領域設計
- Split the system into independent domains:
  - Auth service: OAuth2 / OpenID Connect for login, registration, and authorization.
  - Project/Task service: projects, tasks, Gantt, Kanban.
  - Chat/Notification service: real-time messaging, reminders, push notifications.
  - File/Storage service: uploads, versioning.
- Use an API Gateway (Kong, NGINX) as the unified entry point.

### Data & Storage Choices / 資料庫與儲存選型
- Primary DB: PostgreSQL (or MySQL/MariaDB) with Prisma or TypeORM.
- Cache & session: Redis.
- Object storage: S3-compatible (MinIO or AWS S3).

### CI/CD Pipeline / CI/CD 管線
- GitHub Actions or GitLab CI for tests, lint, build, and deployment to Kubernetes or Docker Swarm.
- Container-first deployment with Helm charts for environment config.

## 2. Backend Layer (API Services) / 後端層

### Language & Framework / 語言與框架
- Node.js + TypeScript
- Framework: NestJS (modular + DI for large systems)
- Dual API support: GraphQL (client flexibility) + REST (external integrations)
- Alternatives: Go (gin/fiber) or ASP.NET Core

### Core Modules / 功能模組
- AuthModule: JWT / Refresh Token, RBAC/ABAC.
- ProjectModule: project CRUD, member management, labels.
- TaskModule: task hierarchy, estimation, scheduling, dependencies.
- KanbanModule: board status, drag-and-drop.
- CalendarModule: Google Calendar / Outlook integration.
- ChatModule: WebSocket or Socket.IO.
- FileModule: multi-file upload, versioning, permissions.

### Testing & Quality / 測試與品質
- Unit: Jest + Supertest
- E2E: Playwright or Cypress
- Lint: ESLint + Prettier + Husky pre-commit hooks

## 3. Frontend Layer (Web, Mobile) / 前端層

### Web / Web 前端
- Next.js + React + TypeScript
- SSR/SSG for SEO and first paint performance
- Data fetching: React Query or Apollo Client
- State: Redux Toolkit / Zustand with React Context

### UI & CSS / UI / CSS 框架
- Tailwind CSS with DaisyUI or Headless UI
- Or Chakra UI / Material UI (with Tailwind for custom needs)

### Design System / 設計系統
- Storybook for component catalog
- Design tokens (colors, typography, spacing) combined with Tailwind

### Mobile / Mobile 前端
- React Native (Expo) or Flutter
- Share domain logic across Web and Mobile via monorepo packages

## 4. Feature & Flow Enhancements / 功能與使用流程重構建議

### Project & Task Management / 專案與任務管理
- Drag-and-drop Kanban, Gantt view
- Task hierarchy, dependencies, estimates vs. actuals
- Labels, priority, story points, attachments

### Collaboration & Communication / 協作與溝通
- Real-time chat: channels, task comments, @mentions
- Notification center: desktop, mobile push, email

### Reporting & Visualization / 報表與視覺化
- Burndown chart, resource allocation, progress dashboard
- Export CSV / PDF

### Extensibility & Integrations / 擴充與整合
- OAuth2 login: Google, GitHub, Microsoft
- Webhooks / API: Jira, Trello, Slack
- Plugin system for third-party extensions

## 5. Best Practices & Operations / 最佳實務與維運

### Engineering Standards / 程式碼規範
- TypeScript strict mode across the repo
- ESLint rules enforced
- Conventional Commits
- Staging & Production with feature flags

### Security & Availability / 安全與可用性
- OWASP checks, rate limiting, CSRF/XSS protection
- Backups & disaster recovery (DB snapshots, object storage versioning)

### Observability / 監控與紀錄
- Logging: Winston or Pino (backend), Sentry (frontend/backend)
- Metrics: Prometheus + Grafana
- Alerting: Opsgenie / PagerDuty

## 6. Migration & Phasing / 遷移與分階段策略

### Phase 0 – Requirements & Design / 需求與設計
- Define core requirements and information architecture
- Establish design system and API specs

### Phase 1 – Foundations / 基礎架構建置
- Set up monorepo, CI/CD, service scaffolds, frontend framework
- Deliver Auth + Project CRUD

### Phase 2 – Tasks & Collaboration / 任務與協作功能
- Implement tasks, Kanban, chat, notifications

### Phase 3 – Reporting & Integrations / 高階報表與外部整合
- Reporting dashboards, webhooks, third-party integrations

### Phase 4 – Optimization / 優化與微調
- Performance tuning, UX improvements, plugin extensibility
