import { db, idFactory } from '../../data/db.js';

const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9_-]{1,11}$/;

const parsePaging = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page ?? '1', 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize ?? '20', 10) || 20, 1), 100);
  return { page, pageSize };
};

const withProjectMeta = async (project) => {
  const [members, milestones, sprints] = await Promise.all([
    db.projectMember.findMany({ where: { projectId: project.id } }),
    db.milestone.findMany({ where: { projectId: project.id } }),
    db.sprint.findMany({ where: { projectId: project.id } }),
  ]);
  return { ...project, members, milestones, sprints };
};

export const projectService = {
  async list(query = {}) {
    const keyword = `${query.q ?? ''}`.trim();
    const status = query.status ?? null;
    const { page, pageSize } = parsePaging(query);

    const where = {
      ...(status ? { status } : {}),
      ...(keyword
        ? { OR: [{ name: { contains: keyword } }, { key: { contains: keyword } }] }
        : {}),
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

  async get(projectId) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    return project ? withProjectMeta(project) : null;
  },

  async timeline(projectId) {
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
    ].sort((a, b) => Date.parse(a.startAt ?? a.endAt ?? '9999-12-31T00:00:00.000Z') - Date.parse(b.startAt ?? b.endAt ?? '9999-12-31T00:00:00.000Z'));

    return { timeline: { project: { id: project.id, key: project.key, name: project.name, status: project.status }, items, lastSync: new Date().toISOString() } };
  },

  async create(payload) {
    if (!payload.key || !PROJECT_KEY_PATTERN.test(payload.key)) {
      return { error: 'project key must be 2-12 chars, uppercase letters/numbers/_/- and start with a letter', status: 422 };
    }

    const existing = await db.project.findUnique({ where: { key: payload.key } });
    if (existing) return { error: 'Project key already exists', status: 409 };

    const project = await db.project.create({
      data: {
        id: idFactory('proj'),
        key: payload.key,
        name: payload.name,
        description: payload.description ?? '',
        ownerId: payload.ownerId ?? 'user-pm',
        status: payload.status ?? 'active',
      },
    });

    return { project: await withProjectMeta(project) };
  },

  async update(projectId, payload) {
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
        ownerId: payload.ownerId ?? project.ownerId,
        status: payload.status ?? project.status,
      },
    });

    return { project: await withProjectMeta(updated) };
  },

  async remove(projectId) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: 'Project not found', status: 404 };

    await db.project.delete({ where: { id: projectId } });
    return { project };
  },

  async archive(projectId) {
    const project = await this.get(projectId);
    if (!project) return { error: 'Project not found', status: 404 };

    const highOpen = await db.issue.count({ where: { projectId, priority: 'high', NOT: { statusId: 'done' } } });
    if (highOpen > 0) return { error: 'Cannot archive project with unfinished high priority issues', status: 409 };

    return this.update(projectId, { status: 'archived' });
  },

  async addMember(projectId, userId, role) {
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
    });
    return { member };
  },

  async createMilestone(projectId, payload) {
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

  async createSprint(projectId, payload) {
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
