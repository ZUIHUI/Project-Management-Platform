import { Router } from "express";
import { db } from "../../data/inMemoryDB.js";
import { ok } from "../shared/http.js";

const router = Router();

router.get("/dashboard", (req, res) => {
  const openIssues = db.issues.filter((issue) => issue.statusId !== "done");
  const overdueIssues = openIssues.filter(
    (issue) => issue.dueDate && new Date(issue.dueDate).getTime() < Date.now(),
  );

  const statusBreakdown = db.statuses.map((status) => ({
    statusId: status.id,
    count: db.issues.filter((issue) => issue.statusId === status.id).length,
  }));

  return ok(res, {
    totals: {
      projects: db.projects.length,
      issues: db.issues.length,
      notifications: db.notifications.length,
      comments: db.comments.length,
      milestones: db.milestones.length,
      sprints: db.sprints.length,
    },
    statusBreakdown,
    openIssues,
    overdueIssues,
  });
});

export default router;
