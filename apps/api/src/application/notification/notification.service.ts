import { isPlatformAdmin, type AuthenticatedUser } from '../../domain/access/accessPolicy.js';
import { accessibleProjectWhere } from '../access/projectAccess.js';
import { db, idFactory } from '../../infrastructure/persistence/index.js';

type JsonRecord = Record<string, unknown>;

const parsePayload = (message: string): JsonRecord | null => {
  try {
    const parsed = JSON.parse(message) as unknown;
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed as JsonRecord : null;
  } catch {
    return null;
  }
};

const issueIdFrom = (message: string) => {
  const issueId = parsePayload(message)?.issueId;
  return typeof issueId === 'string' ? issueId : '';
};

const issueContextSelect = {
  id: true,
  projectId: true,
  number: true,
  title: true,
  project: { select: { key: true, name: true } },
} as const;

const view = <T extends { message: string }>(notification: T, issue?: {
  id: string;
  projectId: string;
  number: number;
  title: string;
  project: { key: string; name: string };
} | null) => {
  const parsedPayload = parsePayload(notification.message);
  const payload = issue && parsedPayload ? {
    ...parsedPayload,
    issueId: issue.id,
    issueNumber: issue.number,
    issueTitle: issue.title,
    projectId: issue.projectId,
    projectKey: issue.project.key,
    projectName: issue.project.name,
  } : parsedPayload ?? notification.message;

  return { ...notification, payload };
};

export const notificationService = {
  async list(actor: AuthenticatedUser) {
    const data = await db.notification.findMany({
      where: { userId: actor.id },
      orderBy: { createdAt: 'desc' },
    });
    const issueIds = [...new Set(data.map((notification) => issueIdFrom(notification.message)).filter(Boolean))];
    const issues = issueIds.length ? await db.issue.findMany({
      where: { id: { in: issueIds }, project: { is: accessibleProjectWhere(actor) } },
      select: issueContextSelect,
    }) : [];
    const issuesById = new Map(issues.map((issue) => [issue.id, issue]));
    return data.map((notification) => view(notification, issuesById.get(issueIdFrom(notification.message))));
  },

  async create(actor: AuthenticatedUser, input: Record<string, unknown>) {
    const userId = typeof input.userId === 'string' && input.userId ? input.userId : actor.id;
    if (userId !== actor.id && !isPlatformAdmin(actor.role)) return { error: 'Forbidden', status: 403 };
    const message = typeof input.message === 'string' ? input.message : null;
    const payload = input.payload;
    if (!message && payload === undefined) return { error: 'message or payload is required', status: 422 };
    if (!(await db.user.findUnique({ where: { id: userId }, select: { id: true } }))) {
      return { error: 'User not found', status: 404 };
    }

    const notification = await db.notification.create({
      data: {
        id: idFactory('noti'),
        userId,
        type: typeof input.type === 'string' ? input.type : 'system',
        message: message ?? JSON.stringify(payload),
        read: false,
      },
    });
    return { notification: view(notification) };
  },

  async markRead(actor: AuthenticatedUser, notificationId: string) {
    const notification = await db.notification.findFirst({
      where: { id: notificationId, userId: actor.id },
    });
    if (!notification) return { error: 'Notification not found', status: 404 };

    const updated = await db.notification.update({ where: { id: notificationId }, data: { read: true } });
    const issueId = issueIdFrom(updated.message);
    const issue = issueId ? await db.issue.findFirst({
      where: { id: issueId, project: { is: accessibleProjectWhere(actor) } },
      select: issueContextSelect,
    }) : null;
    return { notification: view(updated, issue) };
  },
};
