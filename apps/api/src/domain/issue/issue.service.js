import { db, idFactory, persistDb } from "../../data/inMemoryDB.js";
import { STATUS } from "../../config/constants.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const nextIssueNumber = (projectId) => {
  const numbers = db.issues.filter((issue) => issue.projectId === projectId).map((issue) => issue.number);
  return (Math.max(0, ...numbers) || 0) + 1;
};

const logActivity = (actorId, entityType, entityId, action, before, after) => {
  db.activityLogs.unshift({
    id: idFactory("act"),
    actorId,
    entityType,
    entityId,
    action,
    before,
    after,
    createdAt: new Date().toISOString(),
  });
};

const notify = (userId, type, payload) => {
  if (!userId) {
    return;
  }

  db.notifications.unshift({
    id: idFactory("noti"),
    userId,
    type,
    payload,
    read: false,
    createdAt: new Date().toISOString(),
  });
};

const ensureProjectMember = (projectId, userId) =>
  db.projectMembers.some((member) => member.projectId === projectId && member.userId === userId);

const parsePaging = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page ?? `${DEFAULT_PAGE}`, 10) || DEFAULT_PAGE, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(query.pageSize ?? `${DEFAULT_PAGE_SIZE}`, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );

  return { page, pageSize };
};

const normalizeIssue = (issue) => {
  if (!issue) {
    return null;
  }

  return {
    ...issue,
    dueAt: issue.dueAt ?? issue.dueDate ?? null,
  };
};

const parseMentions = (body) => {
  if (!body) {
    return [];
  }

  const matched = body.match(/@([a-zA-Z0-9._-]+)/g) ?? [];
  const unique = [...new Set(matched.map((token) => token.slice(1).toLowerCase()))];
  return db.users.filter((user) => unique.includes(user.name.toLowerCase())).map((user) => user.id);
};

export const issueService = {
  statuses: () => db.statuses,

  board(projectId) {
    return db.statuses
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((status) => ({
        ...status,
        issues: db.issues
          .filter((issue) => issue.projectId === projectId && issue.statusId === status.id)
          .map(normalizeIssue),
      }));
  },

  listByProject(projectId, query = {}) {
    const { page, pageSize } = parsePaging(query);
    const keyword = `${query.q ?? ""}`.trim().toLowerCase();
    const statusId = query.statusId ?? null;
    const assigneeId = query.assigneeId ?? null;
    const sortBy = query.sortBy === "number" ? "number" : "updatedAt";
    const sortOrder = query.order === "asc" ? "asc" : "desc";

    const filtered = db.issues
      .filter((issue) => issue.projectId === projectId)
      .filter((issue) => !statusId || issue.statusId === statusId)
      .filter((issue) => !assigneeId || issue.assigneeId === assigneeId)
      .filter((issue) => !keyword || issue.title.toLowerCase().includes(keyword));

    const sorted = filtered.sort((a, b) => {
      const left = sortBy === "number" ? a.number : Date.parse(a.updatedAt ?? a.createdAt);
      const right = sortBy === "number" ? b.number : Date.parse(b.updatedAt ?? b.createdAt);
      return sortOrder === "asc" ? left - right : right - left;
    });

    const offset = (page - 1) * pageSize;
    const data = sorted.slice(offset, offset + pageSize).map(normalizeIssue);

    return {
      data,
      page,
      pageSize,
      total: sorted.length,
      totalPages: Math.max(Math.ceil(sorted.length / pageSize), 1),
    };
  },

  get(issueId) {
    return normalizeIssue(db.issues.find((item) => item.id === issueId) ?? null);
  },

  create(projectId, payload, actorId = null) {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    if (!payload.title?.trim()) {
      return { error: "title is required", status: 422 };
    }

    if (payload.assigneeId && !ensureProjectMember(projectId, payload.assigneeId)) {
      return { error: "assignee is not in project scope", status: 422 };
    }

    const timestamp = new Date().toISOString();
    const issue = {
      id: idFactory("iss"),
      projectId,
      number: nextIssueNumber(projectId),
      title: payload.title.trim(),
      description: payload.description?.trim() ?? "",
      priority: payload.priority ?? "medium",
      assigneeId: payload.assigneeId ?? null,
      reporterId: payload.reporterId ?? actorId,
      statusId: STATUS.TODO,
      dueAt: payload.dueAt ?? payload.dueDate ?? null,
      sprintId: payload.sprintId ?? null,
      milestoneId: payload.milestoneId ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.issues.push(issue);
    logActivity(actorId, "issue", issue.id, "issue.created", null, issue);
    persistDb();
    notify(issue.assigneeId, "issue.assigned", { issueId: issue.id, issueNumber: issue.number });

    return { issue: normalizeIssue(issue) };
  },

  update(issueId, payload, actorId = null) {
    const issue = db.issues.find((item) => item.id === issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    if (payload.assigneeId && !ensureProjectMember(issue.projectId, payload.assigneeId)) {
      return { error: "assignee is not in project scope", status: 422 };
    }

    const before = { ...issue };
    issue.title = payload.title?.trim() ?? issue.title;
    issue.description = payload.description?.trim() ?? issue.description;
    issue.priority = payload.priority ?? issue.priority;
    issue.dueAt = payload.dueAt ?? payload.dueDate ?? issue.dueAt;
    issue.sprintId = payload.sprintId ?? issue.sprintId;
    issue.milestoneId = payload.milestoneId ?? issue.milestoneId;
    issue.assigneeId = payload.assigneeId ?? issue.assigneeId;
    issue.updatedAt = new Date().toISOString();

    logActivity(actorId, "issue", issue.id, "issue.updated", before, issue);
    persistDb();
    return { issue: normalizeIssue(issue) };
  },

  assign(issueId, assigneeId, actorId = null) {
    const issue = db.issues.find((item) => item.id === issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    if (!assigneeId) {
      return { error: "assigneeId is required", status: 422 };
    }

    if (!ensureProjectMember(issue.projectId, assigneeId)) {
      return { error: "assignee is not in project scope", status: 422 };
    }

    const before = { ...issue };
    issue.assigneeId = assigneeId;
    issue.updatedAt = new Date().toISOString();

    logActivity(actorId, "issue", issue.id, "issue.assigned", before, issue);
    notify(assigneeId, "issue.assigned", { issueId: issue.id, issueNumber: issue.number });
    persistDb();

    return { issue: normalizeIssue(issue) };
  },

  transition(issueId, statusId, actorId = null) {
    const issue = db.issues.find((item) => item.id === issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    if (!db.statuses.some((status) => status.id === statusId)) {
      return { error: "Unknown status", status: 422 };
    }

    const allowed = db.transitions[issue.statusId] ?? [];
    if (!allowed.includes(statusId)) {
      return { error: "Invalid status transition", status: 422, extra: { allowed } };
    }

    const before = { ...issue };
    issue.statusId = statusId;
    issue.updatedAt = new Date().toISOString();
    logActivity(actorId, "issue", issue.id, "issue.status_changed", before, issue);
    persistDb();

    return { issue: normalizeIssue(issue) };
  },

  listComments(issueId) {
    return db.comments.filter((item) => item.issueId === issueId);
  },

  comment(issueId, payload, actorId = null) {
    const issue = db.issues.find((item) => item.id === issueId);
    if (!issue) {
      return { error: "Issue not found", status: 404 };
    }

    if (!payload.body?.trim()) {
      return { error: "body is required", status: 422 };
    }

    const mentionedUserIds = parseMentions(payload.body);
    const comment = {
      id: idFactory("com"),
      issueId,
      authorId: payload.authorId ?? actorId,
      body: payload.body.trim(),
      mentions: mentionedUserIds,
      createdAt: new Date().toISOString(),
    };

    db.comments.push(comment);
    mentionedUserIds.forEach((userId) => {
      notify(userId, "comment.mentioned", { issueId, commentId: comment.id });
    });

    logActivity(actorId, "comment", comment.id, "issue.commented", null, comment);
    persistDb();
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
      dueDate: issue.dueAt ?? null,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    }));
  },
};
