import { db, idFactory } from '../../data/db.js';
import { STATUS } from '../../config/constants.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const parsePaging = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page ?? `${DEFAULT_PAGE}`, 10) || DEFAULT_PAGE, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(query.pageSize ?? `${DEFAULT_PAGE_SIZE}`, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  return { page, pageSize };
};

const normalizeIssue = (issue) => {
  if (!issue) return null;
  const normalized = { ...issue, dueAt: issue.dueDate ? new Date(issue.dueDate).toISOString() : null };
  delete normalized.dueDate;
  return normalized;
};

const ensureProjectMember = async (projectId, userId) =>
  !!(await db.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } }));

const parseMentions = async (body) => {
  if (!body) return [];
  const matched = body.match(/@([a-zA-Z0-9._-]+)/g) ?? [];
  const unique = [...new Set(matched.map((token) => token.slice(1).toLowerCase()))];
  if (!unique.length) return [];
  const users = await db.user.findMany();
  return users.filter((user) => unique.includes(user.name.toLowerCase())).map((u) => u.id);
};

const logActivity = async (actorId, issueId, action, before, after) => {
  await db.activityLog.create({
    data: {
      id: idFactory('act'),
      actorId: actorId ?? null,
      issueId,
      action,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
    },
  });
};

const notify = async (userId, type, payload) => {
  if (!userId) return;
  await db.notification.create({
    data: {
      id: idFactory('noti'),
      userId,
      type,
      message: JSON.stringify(payload),
      read: false,
    },
  });
};

export const issueService = {
  statuses: () => db.status.findMany({ orderBy: { order: 'asc' } }),

  async board(projectId) {
    const [statuses, issues] = await Promise.all([
      db.status.findMany({ orderBy: { order: 'asc' } }),
      db.issue.findMany({ where: { projectId }, orderBy: [{ statusId: 'asc' }, { number: 'asc' }] }),
    ]);

    return statuses.map((status) => ({
      ...status,
      issues: issues.filter((issue) => issue.statusId === status.id).map(normalizeIssue),
    }));
  },

  async listByProject(projectId, query = {}) {
    const { page, pageSize } = parsePaging(query);
    const keyword = `${query.q ?? ''}`.trim();
    const where = {
      projectId,
      ...(query.statusId ? { statusId: query.statusId } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      ...(keyword ? { title: { contains: keyword } } : {}),
    };
    const sortBy = query.sortBy === 'number' ? 'number' : 'updatedAt';
    const sortOrder = query.order === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      db.issue.count({ where }),
      db.issue.findMany({ where, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);

    return {
      data: data.map(normalizeIssue),
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    };
  },

  async get(issueId) {
    return normalizeIssue(await db.issue.findUnique({ where: { id: issueId } }));
  },

  async create(projectId, payload, actorId = null) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: 'Project not found', status: 404 };
    if (!payload.title?.trim()) return { error: 'title is required', status: 422 };
    if (payload.assigneeId && !(await ensureProjectMember(projectId, payload.assigneeId))) {
      return { error: 'assignee is not in project scope', status: 422 };
    }

    const max = await db.issue.aggregate({ where: { projectId }, _max: { number: true } });
    const issue = await db.issue.create({
      data: {
        id: idFactory('iss'),
        projectId,
        number: (max._max.number ?? 0) + 1,
        title: payload.title.trim(),
        description: payload.description?.trim() ?? '',
        priority: payload.priority ?? 'medium',
        assigneeId: payload.assigneeId ?? null,
        reporterId: payload.reporterId ?? actorId,
        statusId: STATUS.TODO,
        dueDate: payload.dueAt ?? payload.dueDate ?? null,
        sprintId: payload.sprintId ?? null,
        milestoneId: payload.milestoneId ?? null,
      },
    });

    await logActivity(actorId, issue.id, 'issue.created', null, issue);
    await notify(issue.assigneeId, 'issue.assigned', { issueId: issue.id, issueNumber: issue.number });
    return { issue: normalizeIssue(issue) };
  },

  async update(issueId, payload, actorId = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };

    if (payload.assigneeId && !(await ensureProjectMember(issue.projectId, payload.assigneeId))) {
      return { error: 'assignee is not in project scope', status: 422 };
    }

    const before = { ...issue };
    const updated = await db.issue.update({
      where: { id: issueId },
      data: {
        title: payload.title?.trim() ?? issue.title,
        description: payload.description?.trim() ?? issue.description,
        priority: payload.priority ?? issue.priority,
        dueDate: payload.dueAt ?? payload.dueDate ?? issue.dueDate,
        sprintId: payload.sprintId ?? issue.sprintId,
        milestoneId: payload.milestoneId ?? issue.milestoneId,
        assigneeId: payload.assigneeId ?? issue.assigneeId,
      },
    });

    await logActivity(actorId, issueId, 'issue.updated', before, updated);
    return { issue: normalizeIssue(updated) };
  },

  async assign(issueId, assigneeId, actorId = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };
    if (!assigneeId) return { error: 'assigneeId is required', status: 422 };
    if (!(await ensureProjectMember(issue.projectId, assigneeId))) return { error: 'assignee is not in project scope', status: 422 };

    const updated = await db.issue.update({ where: { id: issueId }, data: { assigneeId } });
    await logActivity(actorId, issueId, 'issue.assigned', issue, updated);
    await notify(assigneeId, 'issue.assigned', { issueId: updated.id, issueNumber: updated.number });
    return { issue: normalizeIssue(updated) };
  },

  async transition(issueId, statusId, actorId = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };

    const status = await db.status.findUnique({ where: { id: statusId } });
    if (!status) return { error: 'Unknown status', status: 422 };

    const allowedRows = await db.transition.findMany({ where: { fromStatusId: issue.statusId } });
    const allowed = allowedRows.map((row) => row.toStatusId);
    if (!allowed.includes(statusId)) return { error: 'Invalid status transition', status: 422, extra: { allowed } };

    const updated = await db.issue.update({ where: { id: issueId }, data: { statusId } });
    await logActivity(actorId, issueId, 'issue.status_changed', issue, updated);
    return { issue: normalizeIssue(updated) };
  },

  listComments(issueId) {
    return db.comment.findMany({ where: { issueId }, orderBy: { createdAt: 'desc' } });
  },

  async comment(issueId, payload, actorId = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };
    if (!payload.body?.trim()) return { error: 'body is required', status: 422 };

    const comment = await db.comment.create({
      data: {
        id: idFactory('com'),
        issueId,
        authorId: payload.authorId ?? actorId,
        body: payload.body.trim(),
      },
    });

    const mentions = await parseMentions(payload.body);
    await Promise.all(mentions.map((userId) => notify(userId, 'comment.mentioned', { issueId, commentId: comment.id })));
    await logActivity(actorId, issueId, 'issue.commented', null, comment);

    return { comment: { ...comment, mentions } };
  },

  activityLogs() {
    return db.activityLog.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async issueActivity(issueId, query = {}) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };

    const limit = Math.min(Math.max(Number.parseInt(query.limit ?? '50', 10) || 50, 1), 200);
    const data = await db.activityLog.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return { data, limit };
  },

  async legacyTasks() {
    const issues = await db.issue.findMany();
    return issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      projectId: issue.projectId,
      status: issue.statusId,
      priority: issue.priority,
      dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString() : null,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    }));
  },
};
