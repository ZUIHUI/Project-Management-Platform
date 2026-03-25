import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";
import { requireRole } from "../../common/rbac.js";

const router = Router();

const getProjectMembers = (projectId) => {
  return store.projectMembers
    .filter((member) => member.projectId === projectId)
    .map((member) => ({
      ...member,
      user: store.users.find((user) => user.id === member.userId) ?? null,
    }));
};

router.get("/projects", (req, res) => {
  res.json({ data: store.projects });
});

router.get("/projects/:id", (req, res) => {
  const project = store.projects.find((item) => item.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const members = getProjectMembers(project.id);
  res.json({ data: { ...project, members } });
});

router.post("/projects", requireRole("project_admin"), (req, res) => {
  const { key, name, description, status, ownerId } = req.body;
  if (!name || !key) {
    res.status(400).json({ error: "Project key and name are required" });
    return;
  }

  const existingKey = store.projects.some((project) => project.key === key);
  if (existingKey) {
    res.status(409).json({ error: "Project key already exists" });
    return;
  }

  const timestamp = new Date().toISOString();
  const project = {
    id: randomUUID(),
    key,
    name,
    description: description ?? "",
    status: status ?? "active",
    ownerId: ownerId ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  store.projects.unshift(project);
  res.status(201).json({ data: project });
});

router.put("/projects/:id", requireRole("project_admin"), (req, res) => {
  const project = store.projects.find((item) => item.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const { key, name, description, status, ownerId } = req.body;

  if (key && key !== project.key) {
    const keyExists = store.projects.some((item) => item.key === key && item.id !== project.id);
    if (keyExists) {
      res.status(409).json({ error: "Project key already exists" });
      return;
    }
  }

  project.key = key ?? project.key;
  project.name = name ?? project.name;
  project.description = description ?? project.description;
  project.status = status ?? project.status;
  project.ownerId = ownerId ?? project.ownerId;
  project.updatedAt = new Date().toISOString();
  res.json({ data: project });
});

router.post("/projects/:id/members", requireRole("project_admin"), (req, res) => {
  const project = store.projects.find((item) => item.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const { userId, role } = req.body;
  if (!userId || !role) {
    res.status(400).json({ error: "userId and role are required" });
    return;
  }

  const user = store.users.find((item) => item.id === userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const existing = store.projectMembers.find(
    (member) => member.projectId === project.id && member.userId === userId,
  );

  if (existing) {
    existing.role = role;
    res.json({ data: existing });
    return;
  }

  const member = { projectId: project.id, userId, role };
  store.projectMembers.push(member);
  res.status(201).json({ data: member });
});

router.delete("/projects/:id", requireRole("project_admin"), (req, res) => {
  const index = store.projects.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [removed] = store.projects.splice(index, 1);
  res.json({ data: removed });
});

export default router;
