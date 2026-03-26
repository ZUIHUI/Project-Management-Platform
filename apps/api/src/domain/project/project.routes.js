import { Router } from "express";
import { projectService } from "./project.service.js";
import { requireRole } from "../shared/rbac.js";
import { fail, ok } from "../shared/http.js";

const router = Router();

router.get("/projects", (req, res) => ok(res, projectService.list()));

router.get("/projects/:projectId", (req, res) => {
  const project = projectService.get(req.params.projectId);
  if (!project) {
    return fail(res, 404, "Project not found");
  }

  return ok(res, project);
});

router.post("/projects", requireRole("project_admin"), (req, res) => {
  const { key, name } = req.body;
  if (!key || !name) {
    return fail(res, 400, "key and name are required");
  }

  const result = projectService.create(req.body);
  if (result.error) {
    return fail(res, 409, result.error);
  }

  return ok(res, result.project, 201);
});

router.put("/projects/:projectId", requireRole("project_admin"), (req, res) => {
  const result = projectService.update(req.params.projectId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.project);
});

router.post("/projects/:projectId/archive", requireRole("project_admin"), (req, res) => {
  const result = projectService.archive(req.params.projectId);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.project);
});

router.delete("/projects/:projectId", requireRole("project_admin"), (req, res) => {
  const result = projectService.remove(req.params.projectId);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.project);
});

router.post("/projects/:projectId/members", requireRole("project_admin"), (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    return fail(res, 400, "userId and role are required");
  }

  const result = projectService.addMember(req.params.projectId, userId, role);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.member, 201);
});

router.post("/projects/:projectId/milestones", requireRole("member"), (req, res) => {
  if (!req.body.name) {
    return fail(res, 400, "name is required");
  }

  const result = projectService.createMilestone(req.params.projectId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.milestone, 201);
});

router.post("/projects/:projectId/sprints", requireRole("member"), (req, res) => {
  if (!req.body.name) {
    return fail(res, 400, "name is required");
  }

  const result = projectService.createSprint(req.params.projectId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.sprint, 201);
});

export default router;
