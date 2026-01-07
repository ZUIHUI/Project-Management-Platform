import { store } from "../../data/store.js";
import { json } from "../../server/response.js";

export const registerDashboardRoutes = (router, prefix) => {
  router.get(`${prefix}/dashboard`, ({ res }) => {
    const activeProjects = store.projects.filter((project) => project.status === "active");
    const openTasks = store.tasks.filter((task) => task.status !== "done");
    json(res, 200, {
      data: {
        totals: {
          projects: store.projects.length,
          tasks: store.tasks.length,
          notifications: store.notifications.length,
          files: store.files.length,
        },
        activeProjects,
        openTasks,
      },
    });
  });
};
