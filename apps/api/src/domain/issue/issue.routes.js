import { Router } from "express";
import { issueService } from "./issue.service.js";
import { requireRole } from "../shared/rbac.js";
import { fail, ok } from "../shared/http.js";

const router = Router();

router.get("/workflows/statuses", (req, res) => ok(res, issueService.statuses()));
router.get("/projects/:projectId/board", (req, res) => ok(res, issueService.board(req.params.projectId)));
router.get("/projects/:projectId/issues", (req, res) =>
  ok(res, issueService.listByProject(req.params.projectId)),
);

router.post("/projects/:projectId/issues", requireRole("member"), (req, res) => {
  const result = issueService.create(req.params.projectId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error, result.extra);
  }

  return ok(res, result.issue, 201);
});

router.get("/issues/:issueId", (req, res) => {
  const issue = issueService.get(req.params.issueId);
  if (!issue) {
    return fail(res, 404, "Issue not found");
  }

  return ok(res, issue);
});

router.patch("/issues/:issueId", requireRole("member"), (req, res) => {
  const result = issueService.update(req.params.issueId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.issue);
});

router.patch("/issues/:issueId/assignee", requireRole("member"), (req, res) => {
  const result = issueService.assign(req.params.issueId, req.body.assigneeId);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.issue);
});

router.patch("/issues/:issueId/status", requireRole("member"), (req, res) => {
  const { statusId } = req.body;
  if (!statusId) {
    return fail(res, 400, "statusId is required");
  }

  const result = issueService.transition(req.params.issueId, statusId);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error, result.extra);
  }

  return ok(res, result.issue);
});

router.get("/issues/:issueId/comments", (req, res) => ok(res, issueService.listComments(req.params.issueId)));

router.post("/issues/:issueId/comments", requireRole("member"), (req, res) => {
  const result = issueService.comment(req.params.issueId, req.body);
  if (result.error) {
    return fail(res, result.status ?? 400, result.error);
  }

  return ok(res, result.comment, 201);
});

router.get("/activity-logs", requireRole("member"), (req, res) => ok(res, issueService.activityLogs()));

router.get("/tasks", (req, res) => {
  res.set("Deprecation", "true");
  res.set("Sunset", "2026-12-31");
  return ok(res, issueService.legacyTasks());
});

export default router;
