import { registerAuthRoutes } from "./auth/auth.routes.js";
import { registerDashboardRoutes } from "./dashboard/dashboard.routes.js";
import { registerFilesRoutes } from "./files/files.routes.js";
import { registerHealthRoutes } from "./health/health.routes.js";
import { registerNotificationsRoutes } from "./notifications/notifications.routes.js";
import { registerProjectsRoutes } from "./projects/projects.routes.js";
import { registerTasksRoutes } from "./tasks/tasks.routes.js";

export const registerRoutes = (router, prefix) => {
  registerAuthRoutes(router, prefix);
  registerDashboardRoutes(router, prefix);
  registerFilesRoutes(router, prefix);
  registerHealthRoutes(router, prefix);
  registerNotificationsRoutes(router, prefix);
  registerProjectsRoutes(router, prefix);
  registerTasksRoutes(router, prefix);
};
