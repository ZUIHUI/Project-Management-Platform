import dashboardRoutes from "./dashboard/dashboard.routes.js";
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
