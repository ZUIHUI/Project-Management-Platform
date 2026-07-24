import { Router } from "express";
import { projectService } from "../../../application/project/project.service.js";
import { isProjectMemberRole } from "../../../domain/access/accessPolicy.js";
import { requireProjectScope, requireRole } from "../middleware/rbac.js";
import { fail, ok, routeParam } from "../httpResponse.js";

const router = Router();

router.get("/projects", async (req, res) => {
  const result = await projectService.list(req.query, req.currentUser!);
  return ok(res, result.data, 200, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  });
});

router.get("/projects/:projectId", requireProjectScope({ mode: "read" }), async (req, res) => {
  const project = await projectService.get(routeParam(req.params.projectId));
  if (!project) {
    return fail(res, 404, "Project not found");
  }

  return ok(res, project);
});

router.get("/projects/:projectId/timeline", requireProjectScope({ mode: "read" }), async (req, res) => {
  const result = await projectService.timeline(routeParam(req.params.projectId));
  if ('error' in result && result.error) {
    return fail(res, result.status ?? 404, result.error);
  }
  if (!result.timeline) return fail(res, 500, "Timeline unavailable");

  return ok(res, result.timeline, 200, {
    lastSync: result.timeline.lastSync,
  });
});

router.post("/projects", requireRole("project_admin"), async (req, res) => {
  const { key, name } = req.body;
  if (!key || !name) {
    return fail(res, 422, "key and name are required");
  }

  const result = await projectService.create(req.body, req.currentUser!.id);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project, 201);
});

router.put("/projects/:projectId", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), async (req, res) => {
  const result = await projectService.update(routeParam(req.params.projectId), req.body);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project);
});

router.post("/projects/:projectId/archive", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), async (req, res) => {
  const result = await projectService.archive(routeParam(req.params.projectId));
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project);
});

router.delete("/projects/:projectId", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), async (req, res) => {
  const result = await projectService.remove(routeParam(req.params.projectId));
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.project);
});

router.get("/projects/:projectId/member-candidates", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), async (req, res) => {
  const result = await projectService.memberCandidates(routeParam(req.params.projectId), req.query);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.data);
});

router.post("/projects/:projectId/members", requireRole("project_admin"), requireProjectScope({ mode: "admin" }), async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !isProjectMemberRole(role)) {
    return fail(res, 422, "userId and role are required");
  }

  const result = await projectService.addMember(routeParam(req.params.projectId), userId, role);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.member, 201);
});

router.post("/projects/:projectId/milestones", requireRole("member"), requireProjectScope({ mode: "write" }), async (req, res) => {
  if (!req.body.name) {
    return fail(res, 422, "name is required");
  }

  const result = await projectService.createMilestone(routeParam(req.params.projectId), req.body);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.milestone, 201);
});

router.post("/projects/:projectId/sprints", requireRole("member"), requireProjectScope({ mode: "write" }), async (req, res) => {
  if (!req.body.name) {
    return fail(res, 422, "name is required");
  }

  const result = await projectService.createSprint(routeParam(req.params.projectId), req.body);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.sprint, 201);
});

export default router;
