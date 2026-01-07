import { json, methodNotAllowed } from "../_lib/response.js";
import { store } from "../_lib/store.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }
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
}
