import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";

const router = Router();

router.get("/projects", (req, res) => {
  res.json({ data: store.projects });
});

router.get("/projects/:id", (req, res) => {
  const project = store.projects.find((item) => item.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ data: project });
});

router.post("/projects", (req, res) => {
  const { name, description, status } = req.body;
  if (!name) {
    res.status(400).json({ error: "Project name is required" });
    return;
  }
  const timestamp = new Date().toISOString();
  const project = {
    id: randomUUID(),
    name,
    description: description ?? "",
    status: status ?? "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.projects.unshift(project);
  res.status(201).json({ data: project });
});

router.put("/projects/:id", (req, res) => {
  const project = store.projects.find((item) => item.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const { name, description, status } = req.body;
  project.name = name ?? project.name;
  project.description = description ?? project.description;
  project.status = status ?? project.status;
  project.updatedAt = new Date().toISOString();
  res.json({ data: project });
});

router.delete("/projects/:id", (req, res) => {
  const index = store.projects.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [removed] = store.projects.splice(index, 1);
  res.json({ data: removed });
});

export default router;
