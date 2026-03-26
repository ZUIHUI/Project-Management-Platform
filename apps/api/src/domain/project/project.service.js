import { db, idFactory } from "../../data/inMemoryDB.js";

const withProjectMeta = (projectId) => ({
  members: db.projectMembers.filter((member) => member.projectId === projectId),
  milestones: db.milestones.filter((item) => item.projectId === projectId),
  sprints: db.sprints.filter((item) => item.projectId === projectId),
});

export const projectService = {
  list() {
    return db.projects.map((project) => ({
      ...project,
      ...withProjectMeta(project.id),
    }));
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
    const existing = db.projects.find((item) => item.key === payload.key);
    if (existing) {
      return { error: "Project key already exists" };
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
