import { Router } from "express";
import { randomUUID } from "node:crypto";
import { store } from "../../data/store.js";
import { requireRole } from "../../common/rbac.js";

const router = Router();

const appendActivity = ({ actorId, entityId, action, before, after }) => {
  store.activityLogs.unshift({
    id: randomUUID(),
    actorId,
    entityType: "issue",
    entityId,
    action,
    before,
    after,
    createdAt: new Date().toISOString(),
  });
};

const pushNotification = ({ userId, type, title, message }) => {
  if (!userId) {
    return;
  }

  store.notifications.unshift({
    id: randomUUID(),
    userId,
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  });
};

const getNextIssueNumber = (projectId) => {
  const projectIssues = store.issues.filter((issue) => issue.projectId === projectId);
  const maxNumber = projectIssues.reduce((max, issue) => Math.max(max, issue.number), 0);
  return maxNumber + 1;
};

const validateProjectMember = (projectId, userId) => {
  return store.projectMembers.some(
    (member) => member.projectId === projectId && member.userId === userId,
  );
};

router.get("/projects/:projectId/issues", (req, res) => {
  const projectId = req.params.projectId;
  const issues = store.issues.filter((issue) => issue.projectId === projectId);

  res.json({ data: issues });
});


router.get("/issues/:id", (req, res) => {
  const issue = store.issues.find((item) => item.id === req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  res.json({ data: issue });
});

router.post("/projects/:projectId/issues", requireRole("member"), (req, res) => {
  const projectId = req.params.projectId;
  const project = store.projects.find((item) => item.id === projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const { title, description, priority, assigneeId, reporterId, dueDate } = req.body;
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  if (assigneeId && !validateProjectMember(projectId, assigneeId)) {
    res.status(422).json({ error: "assignee is not in project scope" });
    return;
  }

  const now = new Date().toISOString();
  const issue = {
    id: randomUUID(),
    projectId,
    number: getNextIssueNumber(projectId),
    title,
    description: description ?? "",
    statusId: "todo",
    priority: priority ?? "medium",
    assigneeId: assigneeId ?? null,
    reporterId: reporterId ?? null,
    dueDate: dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  };

  store.issues.unshift(issue);
  appendActivity({
    actorId: reporterId ?? null,
    entityId: issue.id,
    action: "issue.created",
    before: null,
    after: issue,
  });

  if (issue.assigneeId) {
    pushNotification({
      userId: issue.assigneeId,
      type: "issue.assigned",
      title: "Issue assigned",
      message: `You were assigned ${project.key}-${issue.number}`,
    });
  }

  res.status(201).json({ data: issue });
});

router.patch("/issues/:id", requireRole("member"), (req, res) => {
  const issue = store.issues.find((item) => item.id === req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  const before = { ...issue };
  const { title, description, priority, assigneeId, dueDate } = req.body;

  if (assigneeId && !validateProjectMember(issue.projectId, assigneeId)) {
    res.status(422).json({ error: "assignee is not in project scope" });
    return;
  }

  issue.title = title ?? issue.title;
  issue.description = description ?? issue.description;
  issue.priority = priority ?? issue.priority;
  issue.assigneeId = assigneeId ?? issue.assigneeId;
  issue.dueDate = dueDate ?? issue.dueDate;
  issue.updatedAt = new Date().toISOString();

  appendActivity({
    actorId: null,
    entityId: issue.id,
    action: "issue.updated",
    before,
    after: issue,
  });

  res.json({ data: issue });
});

router.patch("/issues/:id/status", requireRole("member"), (req, res) => {
  const issue = store.issues.find((item) => item.id === req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  const { statusId } = req.body;
  if (!statusId) {
    res.status(400).json({ error: "statusId is required" });
    return;
  }

  const allowedTransitions = store.workflowTransitions[issue.statusId] ?? [];
  if (!allowedTransitions.includes(statusId)) {
    res.status(422).json({
      error: "Invalid status transition",
      from: issue.statusId,
      to: statusId,
      allowed: allowedTransitions,
    });
    return;
  }

  const before = { ...issue };
  issue.statusId = statusId;
  issue.updatedAt = new Date().toISOString();

  appendActivity({
    actorId: null,
    entityId: issue.id,
    action: "issue.status_changed",
    before,
    after: { ...issue },
  });

  res.json({ data: issue });
});

router.get("/issues/:id/comments", (req, res) => {
  const comments = store.comments.filter((comment) => comment.issueId === req.params.id);
  res.json({ data: comments });
});

router.post("/issues/:id/comments", requireRole("member"), (req, res) => {
  const issue = store.issues.find((item) => item.id === req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  const { authorId, body } = req.body;
  if (!body) {
    res.status(400).json({ error: "body is required" });
    return;
  }

  const comment = {
    id: randomUUID(),
    issueId: issue.id,
    authorId: authorId ?? null,
    body,
    createdAt: new Date().toISOString(),
  };

  store.comments.unshift(comment);
  appendActivity({
    actorId: authorId ?? null,
    entityId: issue.id,
    action: "issue.commented",
    before: null,
    after: comment,
  });

  res.status(201).json({ data: comment });
});

router.get("/activity-logs", requireRole("member"), (req, res) => {
  res.json({ data: store.activityLogs });
});

export default router;
