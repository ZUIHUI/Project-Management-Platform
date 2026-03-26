import { Router } from "express";
import { projectService } from "./project.service.js";
import { requireProjectScope, requireRole } from "../shared/rbac.js";
import { fail, ok } from "../shared/http.js";

const router = Router();

router.get("/projects", (req, res) => {
  const result = projectService.list(req.query);
  return ok(res, result.data, 200, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  });
});

router.get("/projects/:projectId", requireProjectScope({ mode: "read" }), (req, res) => {
  const project = projectService.get(req.params.projectId);
  if (!project) {
    return fail(res, 404, "Project not found");
  }

  return ok(res, project);
});

router.get("/projects/:projectId/timeline", requireProjectScope({ mode: "read" }), (req, res) => {
  const result = projectService.timeline(req.params.projectId);
  if (result.error) {
    return fail(res, result.status ?? 404, result.error);
  }

  return ok(res, result.timeline, 200, {
    lastSync: result.timeline.lastSync,
  });
});

router.post("/projects", requireRole("project_admin"), (req, res) => {
  const { key, name } = req.body;
  if (!key || !name) {
    return fail(res, 422, "key and name are required");
  }

  const result = projectService.create(req.body);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project, 201);
});

router.put("/projects/:projectId", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), (req, res) => {
  const result = projectService.update(req.params.projectId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project);
});

router.post("/projects/:projectId/archive", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), (req, res) => {
  const result = projectService.archive(req.params.projectId);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project);
});

router.delete("/projects/:projectId", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), (req, res) => {
  const result = projectService.remove(req.params.projectId);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project);
});

router.post("/projects/:projectId/members", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    return fail(res, 422, "userId and role are required");
  }

  const result = projectService.addMember(req.params.projectId, userId, role);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.member, 201);
});

router.post("/projects/:projectId/milestones", requireRole("member"), requireProjectScope({ mode: "write" }), (req, res) => {
  if (!req.body.name) {
    return fail(res, 422, "name is required");
  }

  const result = projectService.createMilestone(req.params.projectId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.milestone, 201);
});

router.post("/projects/:projectId/sprints", requireRole("member"), requireProjectScope({ mode: "write" }), (req, res) => {
  if (!req.body.name) {
    return fail(res, 422, "name is required");
  }

  const result = projectService.createSprint(req.params.projectId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.sprint, 201);
});

export default router;
