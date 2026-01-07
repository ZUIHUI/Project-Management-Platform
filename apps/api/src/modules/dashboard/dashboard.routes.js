import { Router } from "express";
import { store } from "../../data/store.js";

const router = Router();

router.get("/dashboard", (req, res) => {
  const activeProjects = store.projects.filter((project) => project.status === "active");
  const openTasks = store.tasks.filter((task) => task.status !== "done");
  res.json({
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

export default router;
