import { Router } from "express";
import { store } from "../../data/store.js";

const router = Router();

router.get("/dashboard", (req, res) => {
  const activeProjects = store.projects.filter((project) => project.status === "active");
  const openIssues = store.issues.filter((issue) => issue.statusId !== "done");
  const overdueIssues = openIssues.filter((issue) => {
    if (!issue.dueDate) {
      return false;
    }

    return new Date(issue.dueDate) < new Date();
  });

  res.json({
    data: {
      totals: {
        projects: store.projects.length,
        issues: store.issues.length,
        notifications: store.notifications.length,
        files: store.files.length,
      },
      activeProjects,
      openIssues,
      overdueIssues,
    },
  });
});

export default router;
