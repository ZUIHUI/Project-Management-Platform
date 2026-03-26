import dashboardRoutes from "./dashboard/dashboard.routes.js";
import filesRoutes from "./files/files.routes.js";
import healthRoutes from "./health/health.routes.js";
import issuesRoutes from "./issues/issues.routes.js";
import notificationsRoutes from "./notifications/notifications.routes.js";
import projectsRoutes from "./projects/projects.routes.js";
import tasksRoutes from "./tasks/tasks.routes.js";

export const routes = [
  authRoutes,
  dashboardRoutes,
  filesRoutes,
  healthRoutes,
  issuesRoutes,
  notificationsRoutes,
  projectsRoutes,
  tasksRoutes,
];
