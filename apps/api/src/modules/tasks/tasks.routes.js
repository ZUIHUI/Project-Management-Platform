import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";

const router = Router();

router.get("/tasks", (req, res) => {
  res.json({ data: store.tasks });
});

router.get("/tasks/:id", (req, res) => {
  const task = store.tasks.find((item) => item.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json({ data: task });
});

router.post("/tasks", (req, res) => {
  const { title, projectId, status, priority, dueDate } = req.body;
  if (!title) {
    res.status(400).json({ error: "Task title is required" });
    return;
  }
  const timestamp = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title,
    projectId: projectId ?? null,
    status: status ?? "todo",
    priority: priority ?? "medium",
    dueDate: dueDate ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.tasks.unshift(task);
  res.status(201).json({ data: task });
});

router.put("/tasks/:id", (req, res) => {
  const task = store.tasks.find((item) => item.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const { title, status, priority, dueDate } = req.body;
  task.title = title ?? task.title;
  task.status = status ?? task.status;
  task.priority = priority ?? task.priority;
  task.dueDate = dueDate ?? task.dueDate;
  task.updatedAt = new Date().toISOString();
  res.json({ data: task });
});

router.delete("/tasks/:id", (req, res) => {
  const index = store.tasks.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const [removed] = store.tasks.splice(index, 1);
  res.json({ data: removed });
});

export default router;
