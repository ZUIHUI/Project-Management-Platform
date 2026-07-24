import { accessibleProjectWhere } from '../access/projectAccess.js';
import type { AuthenticatedUser, ProjectMemberRole } from '../../domain/access/accessPolicy.js';
import { db, idFactory } from '../../infrastructure/persistence/index.js';

const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9_-]{1,11}$/;

const projectMemberUser = {
  select: {
    name: true,
    email: true,
  },
} as const;

const presentProjectMember = (member) => {
  const { user, ...membership } = member;
  return {
    ...membership,
    name: user.name,
    email: user.email,
  };
};

const parsePaging = (query: Record<string, unknown> = {}) => {
  const page = Math.max(Number.parseInt(`${query.page ?? '1'}`, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(`${query.pageSize ?? '20'}`, 10) || 20, 1), 100);
  return { page, pageSize };
};

const parseCandidateLimit = (query: Record<string, unknown> = {}) =>
  Math.min(Math.max(Number.parseInt(`${query.limit ?? '20'}`, 10) || 20, 1), 50);

const withProjectMeta = async (project) => {
  const [members, milestones, sprints] = await Promise.all([
    db.projectMember.findMany({
      where: { projectId: project.id },
      include: { user: projectMemberUser },
    }),
    db.milestone.findMany({ where: { projectId: project.id } }),
    db.sprint.findMany({ where: { projectId: project.id } }),
  ]);
  return { ...project, members: members.map(presentProjectMember), milestones, sprints };
};

export const projectService = {
  async list(query: Record<string, unknown> = {}, actor: AuthenticatedUser) {
    const keyword = `${query.q ?? ''}`.trim();
    const status = query.status ?? null;
    const { page, pageSize } = parsePaging(query);

    const where = {
      AND: [
        accessibleProjectWhere(actor),
        ...(status ? [{ status: `${status}` }] : []),
        ...(keyword ? [{ OR: [{ name: { contains: keyword } }, { key: { contains: keyword } }] }] : []),
      ],
    };

    const [total, projects] = await Promise.all([
      db.project.count({ where }),
      db.project.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: 'desc' } }),
    ]);

    return {
      data: await Promise.all(projects.map(withProjectMeta)),
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    };
  },

  async get(projectId: string) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    return project ? withProjectMeta(project) : null;
  },

  async memberCandidates(projectId: string, query: Record<string, unknown> = {}) {
    const project = await db.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) return { error: 'Project not found', status: 404 };

    const keyword = `${query.q ?? ''}`.trim();
    const limit = parseCandidateLimit(query);
    const memberships = await db.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });
    const existingUserIds = memberships.map((member) => member.userId);
    const data = await db.user.findMany({
      where: {
        id: { notIn: existingUserIds },
        ...(keyword
          ? {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' as const } },
                { email: { contains: keyword, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
      take: limit,
      select: { id: true, name: true, email: true },
    });

    return { data };
  },

  async timeline(projectId: string) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: 'Project not found', status: 404 };

    const [statuses, milestones, sprints, issues] = await Promise.all([
      db.status.findMany(),
      db.milestone.findMany({ where: { projectId } }),
      db.sprint.findMany({ where: { projectId } }),
      db.issue.findMany({ where: { projectId, dueDate: { not: null } } }),
    ]);

    const statusMap = new Map(statuses.map((s) => [s.id, s.name]));
    const items = [
      ...milestones.map((m) => ({ type: 'milestone', id: m.id, name: m.name, startAt: null, endAt: m.dueAt, status: m.status })),
      ...sprints.map((s) => ({ type: 'sprint', id: s.id, name: s.name, startAt: s.startAt, endAt: s.endAt, status: s.status })),
      ...issues.map((i) => ({ type: 'issue', id: i.id, name: `#${i.number} ${i.title}`, startAt: null, endAt: i.dueDate, status: statusMap.get(i.statusId) ?? i.statusId })),
    ].sort(
      (a, b) =>
        new Date(a.startAt ?? a.endAt ?? '9999-12-31T00:00:00.000Z').getTime() -
        new Date(b.startAt ?? b.endAt ?? '9999-12-31T00:00:00.000Z').getTime(),
    );

    return { timeline: { project: { id: project.id, key: project.key, name: project.name, status: project.status }, items, lastSync: new Date().toISOString() } };
  },

  async create(payload: Record<string, any>, actorUserId: string) {
    if (!payload.key || !PROJECT_KEY_PATTERN.test(payload.key)) {
      return { error: 'project key must be 2-12 chars, uppercase letters/numbers/_/- and start with a letter', status: 422 };
    }

    const existing = await db.project.findUnique({ where: { key: payload.key } });
    if (existing) return { error: 'Project key already exists', status: 409 };

    const ownerId = actorUserId;

    const project = await db.project.create({
      data: {
        id: idFactory('proj'),
        key: payload.key,
        name: payload.name,
        description: payload.description ?? '',
        ownerId,
        status: payload.status ?? 'active',
      },
    });

    await db.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: ownerId } },
      update: { role: 'project_admin' },
      create: { projectId: project.id, userId: ownerId, role: 'project_admin' },
    });

    return { project: await withProjectMeta(project) };
  },

  async update(projectId: string, payload: Record<string, any>) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: 'Project not found', status: 404 };

    if (payload.key && payload.key !== project.key) {
      if (!PROJECT_KEY_PATTERN.test(payload.key)) {
        return { error: 'project key must be 2-12 chars, uppercase letters/numbers/_/- and start with a letter', status: 422 };
      }
      const existing = await db.project.findUnique({ where: { key: payload.key } });
      if (existing && existing.id !== projectId) return { error: 'Project key already exists', status: 409 };
    }

    const updated = await db.project.update({
      where: { id: projectId },
      data: {
        key: payload.key ?? project.key,
        name: payload.name ?? project.name,
        description: payload.description ?? project.description,
        status: payload.status ?? project.status,
      },
    });

    if (payload.status && payload.status !== project.status) {
      const members = await db.projectMember.findMany({ where: { projectId }, select: { userId: true } });
      const targetUserIds = [...new Set([project.ownerId, ...members.map((member) => member.userId)])];
      if (targetUserIds.length > 0) {
        await db.notification.createMany({
          data: targetUserIds.map((userId) => ({
            id: idFactory('noti'),
            userId,
            type: 'project_status_changed',
            message: `Project ${updated.key} status changed: ${project.status} → ${updated.status}`,
            read: false,
          })),
        });
      }
    }

    return { project: await withProjectMeta(updated) };
  },

  async remove(projectId: string) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: 'Project not found', status: 404 };

    const issues = await db.issue.findMany({ where: { projectId }, select: { id: true } });
    const issueIds = issues.map((issue) => issue.id);

    await db.$transaction([
      db.activityLog.deleteMany({ where: { issueId: { in: issueIds } } }),
      db.comment.deleteMany({ where: { issueId: { in: issueIds } } }),
      db.issue.deleteMany({ where: { projectId } }),
      db.milestone.deleteMany({ where: { projectId } }),
      db.sprint.deleteMany({ where: { projectId } }),
      db.projectMember.deleteMany({ where: { projectId } }),
      db.project.delete({ where: { id: projectId } }),
    ]);
    return { project };
  },

  async archive(projectId: string) {
    const project = await this.get(projectId);
    if (!project) return { error: 'Project not found', status: 404 };

    const highOpen = await db.issue.count({ where: { projectId, priority: 'high', NOT: { statusId: 'done' } } });
    if (highOpen > 0) return { error: 'Cannot archive project with unfinished high priority issues', status: 409 };

    return this.update(projectId, { status: 'archived' });
  },

  async addMember(projectId: string, userId: string, role: ProjectMemberRole) {
    const [project, user] = await Promise.all([
      db.project.findUnique({ where: { id: projectId } }),
      db.user.findUnique({ where: { id: userId } }),
    ]);
    if (!project) return { error: 'Project not found', status: 404 };
    if (!user) return { error: 'User not found', status: 404 };

    const member = await db.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
      include: { user: projectMemberUser },
    });
    return { member: presentProjectMember(member) };
  },

  async createMilestone(projectId: string, payload: Record<string, any>) {
    if (!(await db.project.findUnique({ where: { id: projectId } }))) return { error: 'Project not found', status: 404 };

    const milestone = await db.milestone.create({
      data: {
        id: idFactory('ms'),
        projectId,
        name: payload.name,
        dueAt: payload.dueAt ?? null,
        status: payload.status ?? 'open',
      },
    });
    return { milestone };
  },

  async createSprint(projectId: string, payload: Record<string, any>) {
    if (!(await db.project.findUnique({ where: { id: projectId } }))) return { error: 'Project not found', status: 404 };
    if (payload.startAt && payload.endAt && new Date(payload.startAt) >= new Date(payload.endAt)) {
      return { error: 'startAt must be earlier than endAt', status: 422 };
    }

    const sprint = await db.sprint.create({
      data: {
        id: idFactory('sp'),
        projectId,
        name: payload.name,
        goal: payload.goal ?? '',
        startAt: payload.startAt ?? new Date().toISOString(),
        endAt: payload.endAt ?? null,
        status: payload.status ?? 'planned',
      },
    });
    return { sprint };
  },
};
