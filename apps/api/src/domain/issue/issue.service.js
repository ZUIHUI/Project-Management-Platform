import { db, idFactory } from "../../data/inMemoryDB.js";
import { STATUS } from "../../config/constants.js";

const nextIssueNumber = (projectId) => {
  const numbers = db.issues.filter((issue) => issue.projectId === projectId).map((issue) => issue.number);
  return (Math.max(0, ...numbers) || 0) + 1;
};

const logActivity = (actorId, issueId, action, before, after) => {
  db.activityLogs.unshift({
    id: idFactory("act"),
    actorId,
    issueId,
    action,
    before,
    after,
    createdAt: new Date().toISOString(),
  });
};

const notify = (userId, type, message) => {
  if (!userId) {
    return;
  }

  db.notifications.unshift({
    id: idFactory("noti"),
    userId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
};

const ensureProjectMember = (projectId, userId) =>
  db.projectMembers.some((member) => member.projectId === projectId && member.userId === userId);

export const issueService = {
  statuses: () => db.statuses,

  board(projectId) {
    return db.statuses
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((status) => ({
        ...status,
        issues: db.issues.filter((issue) => issue.projectId === projectId && issue.statusId === status.id),
      }));
  },

  listByProject(projectId) {
    return db.issues.filter((issue) => issue.projectId === projectId);
  },

  get(issueId) {
    return db.issues.find((item) => item.id === issueId) ?? null;
  },

  create(projectId, payload) {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    if (!payload.title) {
      return { error: "title is required", status: 400 };
    }

    if (payload.assigneeId && !ensureProjectMember(projectId, payload.assigneeId)) {
      return { error: "assignee is not in project scope", status: 422 };
    }

    const timestamp = new Date().toISOString();
    const issue = {
      id: idFactory("iss"),
      projectId,
      number: nextIssueNumber(projectId),
      title: payload.title,
      description: payload.description ?? "",
      priority: payload.priority ?? "medium",
      assigneeId: payload.assigneeId ?? null,
      reporterId: payload.reporterId ?? null,
      statusId: STATUS.TODO,
      dueDate: payload.dueDate ?? null,
      sprintId: payload.sprintId ?? null,
      milestoneId: payload.milestoneId ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.issues.push(issue);
    logActivity(payload.reporterId ?? null, issue.id, "issue.created", null, issue);
    notify(issue.assigneeId, "issue.assigned", `Assigned issue #${issue.number}`);

    return { issue };
  },

  update(issueId, payload) {
    const issue = this.get(issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    if (payload.assigneeId && !ensureProjectMember(issue.projectId, payload.assigneeId)) {
      return { error: "assignee is not in project scope", status: 422 };
    }

    const before = { ...issue };
    issue.title = payload.title ?? issue.title;
    issue.description = payload.description ?? issue.description;
    issue.priority = payload.priority ?? issue.priority;
    issue.dueDate = payload.dueDate ?? issue.dueDate;
    issue.sprintId = payload.sprintId ?? issue.sprintId;
    issue.milestoneId = payload.milestoneId ?? issue.milestoneId;
    issue.assigneeId = payload.assigneeId ?? issue.assigneeId;
    issue.updatedAt = new Date().toISOString();

    logActivity(null, issue.id, "issue.updated", before, issue);
    return { issue };
  },

  assign(issueId, assigneeId) {
    const issue = this.get(issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    if (!assigneeId) {
      return { error: "assigneeId is required", status: 400 };
    }

    if (!ensureProjectMember(issue.projectId, assigneeId)) {
      return { error: "assignee is not in project scope", status: 422 };
    }

    const before = { ...issue };
    issue.assigneeId = assigneeId;
    issue.updatedAt = new Date().toISOString();

    logActivity(null, issue.id, "issue.assigned", before, issue);
    notify(assigneeId, "issue.assigned", `Assigned issue #${issue.number}`);

    return { issue };
  },

  transition(issueId, statusId) {
    const issue = this.get(issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    const allowed = db.transitions[issue.statusId] ?? [];
    if (!allowed.includes(statusId)) {
      return { error: "Invalid status transition", status: 422, extra: { allowed } };
    }

    const before = { ...issue };
    issue.statusId = statusId;
    issue.updatedAt = new Date().toISOString();
    logActivity(null, issue.id, "issue.status_changed", before, issue);

    return { issue };
  },

  listComments(issueId) {
    return db.comments.filter((item) => item.issueId === issueId);
  },

  comment(issueId, payload) {
    const issue = this.get(issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    if (!payload.body) {
      return { error: "body is required", status: 400 };
    }

    const comment = {
      id: idFactory("com"),
      issueId,
      authorId: payload.authorId ?? null,
      body: payload.body,
      createdAt: new Date().toISOString(),
    };

    db.comments.push(comment);
    logActivity(payload.authorId ?? null, issueId, "issue.commented", null, comment);
    return { comment };
  },

  activityLogs() {
    return db.activityLogs;
  },

  legacyTasks() {
    return db.issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      projectId: issue.projectId,
      status: issue.statusId,
      priority: issue.priority,
      dueDate: issue.dueDate,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    }));
  },
};
