import { Router } from "express";
import { issueService } from "../../../application/issue/issue.service.js";
import { requireProjectScope, requireRole } from "../middleware/rbac.js";
import { fail, ok, routeParam } from "../httpResponse.js";

const router = Router();

router.get("/workflows/statuses", async (req, res) => ok(res, await issueService.statuses()));

router.get("/projects/:projectId/board", requireProjectScope({ mode: "read" }), async (req, res) => {
  return ok(res, await issueService.board(routeParam(req.params.projectId)));
});

router.get("/projects/:projectId/issues", requireProjectScope({ mode: "read" }), async (req, res) => {
  const result = await issueService.listByProject(routeParam(req.params.projectId), req.query);
  return ok(res, result.data, 200, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  });
});

router.post("/projects/:projectId/issues", requireRole("member"), requireProjectScope({ mode: "write" }), async (req, res) => {
  const result = await issueService.create(routeParam(req.params.projectId), req.body, req.currentUser?.id ?? null);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.issue, 201);
});

router.get("/issues/:issueId", requireProjectScope({ mode: "read", source: "issue" }), async (req, res) => {
  const issue = await issueService.get(routeParam(req.params.issueId));
  if (!issue) {
    return fail(res, 404, "Issue not found");
  }

  return ok(res, issue);
});

router.patch("/issues/:issueId", requireRole("member"), requireProjectScope({ mode: "write", source: "issue" }), async (req, res) => {
  const result = await issueService.update(routeParam(req.params.issueId), req.body, req.currentUser?.id ?? null);
  if ("error" in result) {
    return fail(res, result.status, result.error);
  }

  return ok(res, result.issue);
});

router.patch("/issues/:issueId/assignee", requireRole("member"), requireProjectScope({ mode: "write", source: "issue" }), async (req, res) => {
  const result = await issueService.assign(routeParam(req.params.issueId), req.body.assigneeId, req.currentUser?.id ?? null);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.issue);
});

router.patch("/issues/:issueId/status", requireRole("member"), requireProjectScope({ mode: "write", source: "issue" }), async (req, res) => {
  const { statusId } = req.body;
  if (!statusId) {
    return fail(res, 422, "statusId is required");
  }

  const result = await issueService.transition(routeParam(req.params.issueId), statusId, req.currentUser?.id ?? null);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error, result.extra);
  }

  return ok(res, result.issue);
});

router.get("/issues/:issueId/comments", requireProjectScope({ mode: "read", source: "issue" }), async (req, res) => ok(res, await issueService.listComments(routeParam(req.params.issueId))));

router.post("/issues/:issueId/comments", requireRole("member"), requireProjectScope({ mode: "write", source: "issue" }), async (req, res) => {
  const result = await issueService.comment(routeParam(req.params.issueId), req.body, req.currentUser?.id ?? null);
  if (result.error) {
    return fail(res, result.status ?? 422, result.error);
  }

  return ok(res, result.comment, 201);
});

router.get("/activity-logs", requireRole("member"), async (req, res) =>
  ok(res, await issueService.activityLogs(req.currentUser!)),
);

router.get("/issues/:issueId/activity", requireProjectScope({ mode: "read", source: "issue" }), async (req, res) => {
  const result = await issueService.issueActivity(routeParam(req.params.issueId), req.query);
  if (result.error) {
    return fail(res, result.status ?? 404, result.error);
  }

  return ok(res, result.data, 200, { limit: result.limit });
});

router.get("/tasks", async (req, res) => {
  res.set("Deprecation", "true");
  res.set("Sunset", "2026-12-31");
  return ok(res, await issueService.legacyTasks(req.currentUser!));
});

export default router;
