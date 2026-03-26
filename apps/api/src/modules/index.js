import dashboardRoutes from "./dashboard/dashboard.routes.js";
import notificationsRoutes from "./notifications/notifications.routes.js";
import projectsRoutes from "./projects/projects.routes.js";
import tasksRoutes from "./tasks/tasks.routes.js";

// Compatibility list for branches still importing from modules/index.js.
export const routes = [dashboardRoutes, notificationsRoutes, projectsRoutes, tasksRoutes];
