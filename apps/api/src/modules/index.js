import authRoutes from "./auth/auth.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import filesRoutes from "./files/files.routes.js";
import healthRoutes from "./health/health.routes.js";
import notificationsRoutes from "./notifications/notifications.routes.js";
import projectsRoutes from "./projects/projects.routes.js";
import tasksRoutes from "./tasks/tasks.routes.js";

export const routes = [
  authRoutes,
  dashboardRoutes,
  filesRoutes,
  healthRoutes,
  notificationsRoutes,
  projectsRoutes,
  tasksRoutes,
];
