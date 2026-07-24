import { accessibleProjectWhere } from '../access/projectAccess.js';
import type { AuthenticatedUser } from '../../domain/access/accessPolicy.js';
import { db, idFactory } from '../../infrastructure/persistence/index.js';
import { STATUS } from '../../config/constants.js';
import { prepareIssueUpdate } from './issueUpdate.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const parsePaging = (query: Record<string, unknown> = {}) => {
  const page = Math.max(Number.parseInt(`${query.page ?? DEFAULT_PAGE}`, 10) || DEFAULT_PAGE, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(`${query.pageSize ?? DEFAULT_PAGE_SIZE}`, 10) || DEFAULT_PAGE_SIZE, 1),
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

const notifyAssignment = async (issue) => {
  await notify(issue.assigneeId, 'issue.assigned', {
    issueId: issue.id,
    issueNumber: issue.number,
    issueTitle: issue.title,
    projectId: issue.projectId,
  });
};

const activityInclude = {
  actor: { select: { name: true, email: true } },
  issue: {
    select: {
      projectId: true,
      number: true,
      title: true,
      project: { select: { key: true, name: true } },
    },
  },
} as const;

type ActivityUserReference = {
  id: string;
  name: string;
};

const parseActivitySnapshot = (value: string | null) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
};

const getActivityAssigneeIds = (activity: { before: string | null; after: string | null }) => {
  const before = parseActivitySnapshot(activity.before);
  const after = parseActivitySnapshot(activity.after);
  return [...new Set(
    [before?.assigneeId, after?.assigneeId]
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  )];
};

const loadActivityUserReferences = async (
  activities: Array<{ before: string | null; after: string | null }>,
) => {
  const userIds = [...new Set(activities.flatMap(getActivityAssigneeIds))];
  if (!userIds.length) return new Map<string, ActivityUserReference>();

  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  return new Map(users.map((user) => [user.id, user]));
};

const commentInclude = {
  author: { select: { name: true, email: true } },
} as const;

const viewComment = (comment) => {
  const { author, ...record } = comment;
  return {
    ...record,
    authorName: author?.name ?? 'System',
    authorEmail: author?.email ?? null,
  };
};

const viewActivity = (
  activity,
  userReferenceMap: Map<string, ActivityUserReference>,
) => {
  const { actor, issue, ...record } = activity;
  const userReferences = getActivityAssigneeIds(activity)
    .map((userId) => userReferenceMap.get(userId))
    .filter((reference): reference is ActivityUserReference => Boolean(reference));
  return {
    ...record,
    actorName: actor?.name ?? 'System',
    actorEmail: actor?.email ?? null,
    projectId: issue.projectId,
    projectKey: issue.project.key,
    projectName: issue.project.name,
    issueNumber: issue.number,
    issueTitle: issue.title,
    userReferences,
  };
};

const viewActivities = async (activities) => {
  const userReferenceMap = await loadActivityUserReferences(activities);
  return activities.map((activity) => viewActivity(activity, userReferenceMap));
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

  async listByProject(projectId: string, query: Record<string, any> = {}) {
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

  async create(projectId: string, payload: Record<string, any>, actorId: string | null = null) {
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
        reporterId: actorId,
        statusId: STATUS.TODO,
        dueDate: payload.dueAt ?? payload.dueDate ?? null,
        sprintId: payload.sprintId ?? null,
        milestoneId: payload.milestoneId ?? null,
      },
    });

    await logActivity(actorId, issue.id, 'issue.created', null, issue);
    await notifyAssignment(issue);
    return { issue: normalizeIssue(issue) };
  },

  async update(issueId: string, payload: Record<string, any>, actorId: string | null = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };

    if (payload.assigneeId && !(await ensureProjectMember(issue.projectId, payload.assigneeId))) {
      return { error: 'assignee is not in project scope', status: 422 };
    }

    const updatePlan = prepareIssueUpdate(issue, payload);
    if ('error' in updatePlan) return updatePlan;
    if (!updatePlan.changed) return { issue: normalizeIssue(issue) };

    const before = { ...issue };
    const updated = await db.issue.update({
      where: { id: issueId },
      data: updatePlan.data,
    });

    await logActivity(actorId, issueId, 'issue.updated', before, updated);
    if (updated.assigneeId !== issue.assigneeId) await notifyAssignment(updated);
    return { issue: normalizeIssue(updated) };
  },

  async assign(issueId: string, assigneeId: string | null, actorId: string | null = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };
    if (assigneeId && !(await ensureProjectMember(issue.projectId, assigneeId))) {
      return { error: 'assignee is not in project scope', status: 422 };
    }
    if (assigneeId === issue.assigneeId) return { issue: normalizeIssue(issue) };

    const updated = await db.issue.update({ where: { id: issueId }, data: { assigneeId } });
    await logActivity(actorId, issueId, 'issue.assigned', issue, updated);
    await notifyAssignment(updated);
    return { issue: normalizeIssue(updated) };
  },

  async transition(issueId: string, statusId: string, actorId: string | null = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };

    const [currentStatus, status] = await Promise.all([
      db.status.findUnique({ where: { id: issue.statusId } }),
      db.status.findUnique({ where: { id: statusId } }),
    ]);
    if (!status) return { error: 'Unknown status', status: 422 };

    const allowedRows = await db.transition.findMany({ where: { fromStatusId: issue.statusId } });
    const allowed = allowedRows.map((row) => row.toStatusId);
    if (!allowed.includes(statusId)) return { error: 'Invalid status transition', status: 422, extra: { allowed } };

    const updated = await db.issue.update({ where: { id: issueId }, data: { statusId } });
    await logActivity(actorId, issueId, 'issue.status_changed', issue, updated);
    if (updated.assigneeId && updated.assigneeId !== actorId) {
      await notify(updated.assigneeId, 'workflow_status_changed', {
        issueId: updated.id,
        issueNumber: updated.number,
        issueTitle: updated.title,
        projectId: updated.projectId,
        fromStatusId: issue.statusId,
        fromStatusName: currentStatus?.name ?? issue.statusId,
        toStatusId: status.id,
        toStatusName: status.name,
      });
    }
    return { issue: normalizeIssue(updated) };
  },

  async listComments(issueId) {
    const data = await db.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' },
      include: commentInclude,
    });
    return data.map(viewComment);
  },

  async comment(issueId: string, payload: Record<string, any>, actorId: string | null = null) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };
    if (!payload.body?.trim()) return { error: 'body is required', status: 422 };

    const comment = await db.comment.create({
      data: {
        id: idFactory('com'),
        issueId,
        authorId: actorId,
        body: payload.body.trim(),
      },
      include: commentInclude,
    });

    const mentions = await parseMentions(payload.body);
    await Promise.all(mentions.map((userId) => notify(userId, 'comment.mentioned', {
      issueId,
      issueNumber: issue.number,
      issueTitle: issue.title,
      projectId: issue.projectId,
      commentId: comment.id,
    })));
    await logActivity(actorId, issueId, 'issue.commented', null, comment);

    return { comment: { ...viewComment(comment), mentions } };
  },

  async activityLogs(actor: AuthenticatedUser) {
    const data = await db.activityLog.findMany({
      where: { issue: { project: { is: accessibleProjectWhere(actor) } } },
      orderBy: { createdAt: 'desc' },
      include: activityInclude,
    });
    return viewActivities(data);
  },

  async issueActivity(issueId: string, query: Record<string, any> = {}) {
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue) return { error: 'Issue not found', status: 404 };

    const limit = Math.min(Math.max(Number.parseInt(query.limit ?? '50', 10) || 50, 1), 200);
    const data = await db.activityLog.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: activityInclude,
    });
    return { data: await viewActivities(data), limit };
  },

  async legacyTasks(actor: AuthenticatedUser) {
    const issues = await db.issue.findMany({ where: { project: { is: accessibleProjectWhere(actor) } } });
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
