import cors from 'cors';
import express from 'express';
import { API_PREFIX } from '../config/constants.js';
import { toErrorResponse } from '../interfaces/http/errors.js';
import { fail } from '../interfaces/http/httpResponse.js';
import { requireAuth } from '../interfaces/http/middleware/rbac.js';
import { authRouter } from '../interfaces/http/routes/auth.routes.js';
import dashboardRoutes from '../interfaces/http/routes/dashboard.routes.js';
import healthRoutes from '../interfaces/http/routes/health.routes.js';
import issueRoutes from '../interfaces/http/routes/issue.routes.js';
import notificationRoutes from '../interfaces/http/routes/notification.routes.js';
import openapiRoutes from '../interfaces/http/routes/openapi.routes.js';
import projectRoutes from '../interfaces/http/routes/project.routes.js';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({ message: 'Project Management API', version: 'v1' });
  });

  app.use(API_PREFIX, authRouter);
  app.use(API_PREFIX, healthRoutes);
  app.use(API_PREFIX, openapiRoutes);
  app.use(API_PREFIX, requireAuth, projectRoutes);
  app.use(API_PREFIX, requireAuth, issueRoutes);
  app.use(API_PREFIX, requireAuth, dashboardRoutes);
  app.use(API_PREFIX, requireAuth, notificationRoutes);

  app.use((_req, res) => fail(res, 404, 'Route not found'));
  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(error);
    const normalized = toErrorResponse(error);
    return res.status(normalized.status).json(normalized.body);
  });

  return app;
};
