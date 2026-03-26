import { db, idFactory } from "../../data/inMemoryDB.js";

const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9_-]{1,11}$/;

const withProjectMeta = (projectId) => ({
  members: db.projectMembers.filter((member) => member.projectId === projectId),
  milestones: db.milestones.filter((item) => item.projectId === projectId),
  sprints: db.sprints.filter((item) => item.projectId === projectId),
});

const parsePaging = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page ?? "1", 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize ?? "20", 10) || 20, 1), 100);
  return { page, pageSize };
};

export const projectService = {
  list(query = {}) {
    const keyword = `${query.q ?? ""}`.trim().toLowerCase();
    const status = query.status ?? null;
    const { page, pageSize } = parsePaging(query);

    const filtered = db.projects
      .filter((project) => !status || project.status === status)
      .filter(
        (project) =>
          !keyword ||
          project.name.toLowerCase().includes(keyword) ||
          project.key.toLowerCase().includes(keyword),
      );

    const offset = (page - 1) * pageSize;
    const data = filtered.slice(offset, offset + pageSize).map((project) => ({
      ...project,
      ...withProjectMeta(project.id),
    }));

    return {
      data,
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
    };
  },

  get(projectId) {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) {
      return null;
    }

    return {
      ...project,
      ...withProjectMeta(projectId),
    };
  },

  create(payload) {
    if (!payload.key || !PROJECT_KEY_PATTERN.test(payload.key)) {
      return {
        error: "project key must be 2-12 chars, uppercase letters/numbers/_/- and start with a letter",
        status: 422,
      };
    }

    const existing = db.projects.find((item) => item.key === payload.key);
    if (existing) {
      return { error: "Project key already exists", status: 409 };
    }

    const timestamp = new Date().toISOString();
    const project = {
      id: idFactory("proj"),
      key: payload.key,
      name: payload.name,
      description: payload.description ?? "",
      ownerId: payload.ownerId ?? null,
      status: payload.status ?? "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.projects.push(project);
    return { project: this.get(project.id) };
  },

  update(projectId, payload) {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    if (payload.key && payload.key !== project.key) {
      if (!PROJECT_KEY_PATTERN.test(payload.key)) {
        return {
          error: "project key must be 2-12 chars, uppercase letters/numbers/_/- and start with a letter",
          status: 422,
        };
      }

      const existing = db.projects.find((item) => item.key === payload.key && item.id !== projectId);
      if (existing) {
        return { error: "Project key already exists", status: 409 };
      }
    }

    project.key = payload.key ?? project.key;
    project.name = payload.name ?? project.name;
    project.description = payload.description ?? project.description;
    project.ownerId = payload.ownerId ?? project.ownerId;
    project.status = payload.status ?? project.status;
    project.updatedAt = new Date().toISOString();

    return { project: this.get(projectId) };
  },

  remove(projectId) {
    const index = db.projects.findIndex((item) => item.id === projectId);
    if (index < 0) {
      return { error: "Project not found", status: 404 };
    }

    const [project] = db.projects.splice(index, 1);
    db.projectMembers = db.projectMembers.filter((item) => item.projectId !== projectId);
    db.milestones = db.milestones.filter((item) => item.projectId !== projectId);
    db.sprints = db.sprints.filter((item) => item.projectId !== projectId);

    return { project };
  },

  archive(projectId) {
    const project = this.get(projectId);
    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    const hasBlockingIssue = db.issues.some(
      (issue) => issue.projectId === projectId && issue.priority === "high" && issue.statusId !== "done",
    );
    if (hasBlockingIssue) {
      return {
        error: "Cannot archive project with unfinished high priority issues",
        status: 409,
      };
    }

    return this.update(projectId, { status: "archived" });
  },

  addMember(projectId, userId, role) {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    const user = db.users.find((item) => item.id === userId);
    if (!user) {
      return { error: "User not found", status: 404 };
    }

    const existing = db.projectMembers.find(
      (member) => member.projectId === projectId && member.userId === userId,
    );

    if (existing) {
      existing.role = role;
      return { member: existing };
    }

    const member = { projectId, userId, role };
    db.projectMembers.push(member);
    return { member };
  },

  createMilestone(projectId, payload) {
    if (!db.projects.some((project) => project.id === projectId)) {
      return { error: "Project not found", status: 404 };
    }

    const milestone = {
      id: idFactory("ms"),
      projectId,
      name: payload.name,
      dueAt: payload.dueAt ?? null,
      status: payload.status ?? "open",
      createdAt: new Date().toISOString(),
    };

    db.milestones.push(milestone);
    return { milestone };
  },

  createSprint(projectId, payload) {
    if (!db.projects.some((project) => project.id === projectId)) {
      return { error: "Project not found", status: 404 };
    }

    if (payload.startAt && payload.endAt && new Date(payload.startAt) >= new Date(payload.endAt)) {
      return { error: "startAt must be earlier than endAt", status: 422 };
    }

    const sprint = {
      id: idFactory("sp"),
      projectId,
      name: payload.name,
      goal: payload.goal ?? "",
      startAt: payload.startAt ?? new Date().toISOString(),
      endAt: payload.endAt ?? null,
      status: payload.status ?? "planned",
      createdAt: new Date().toISOString(),
    };

    db.sprints.push(sprint);
    return { sprint };
  },
};
