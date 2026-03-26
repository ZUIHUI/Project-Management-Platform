import { Router } from "express";
import { store } from "../../data/store.js";

const router = Router();

const toLegacyTask = (issue) => ({
  id: issue.id,
  title: issue.title,
  projectId: issue.projectId,
  status: issue.statusId,
  priority: issue.priority,
  dueDate: issue.dueDate,
  createdAt: issue.createdAt,
  updatedAt: issue.updatedAt,
});

router.get("/tasks", (req, res) => {
  res.set("Deprecation", "true");
  res.set("Sunset", "2026-12-31");
  res.json({
    data: store.issues.map(toLegacyTask),
    migration: "Use GET /api/v1/projects/:projectId/issues",
  });
});

router.get("/tasks/:id", (req, res) => {
  const issue = store.issues.find((item) => item.id === req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.set("Deprecation", "true");
  res.set("Sunset", "2026-12-31");
  res.json({
    data: toLegacyTask(issue),
    migration: "Use /api/v1/issues/:id",
  });
});

export default router;
