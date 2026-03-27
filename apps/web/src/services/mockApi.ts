import type { AxiosRequestConfig, AxiosResponse } from "axios";

const now = () => new Date().toISOString();

const db = {
  users: [
    {
      id: "user-demo",
      name: "Demo User",
      email: "demo@example.com",
      password: "demo1234",
      role: "member",
    },
  ],
  projects: [
    {
      id: "proj-1",
      key: "DEMO",
      name: "GitHub Pages Demo",
      description: "Static demo mode without backend service.",
      status: "active",
      members: [{ projectId: "proj-1", userId: "user-pm", role: "project_admin" }],
      milestones: [],
      sprints: [],
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  issues: [],
  notifications: [],
  statuses: ["todo", "doing", "done"],
};

let seq = 1;
const nextId = (prefix: string) => `${prefix}-${seq++}`;
const fakeToken = (prefix: string, userId: string) => `${prefix}-${userId}-${Date.now()}`;

const body = (config: AxiosRequestConfig) => {
  if (!config.data) return {};
  if (typeof config.data === "string") return JSON.parse(config.data);
  return config.data as Record<string, unknown>;
};

const ok = (data: unknown, status = 200): AxiosResponse => ({
  data: { data },
  status,
  statusText: "OK",
  headers: {},
  config: {},
});

export const mockAdapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toLowerCase();

  if (method === "post" && url === "/register") {
    const payload = body(config);
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");
    const name = String(payload.name ?? "").trim();

    if (!email || !password || !name) {
      return ok({ error: { message: "name, email and password are required", status: 422 } }, 422);
    }

    const existing = db.users.find((user) => user.email === email);
    if (existing) {
      return ok({ error: { message: "User already exists", status: 409 } }, 409);
    }

    const user = {
      id: nextId("user"),
      name,
      email,
      password,
      role: String(payload.role ?? "member"),
    };
    db.users.push(user);

    return ok(
      {
        accessToken: fakeToken("access", user.id),
        refreshToken: fakeToken("refresh", user.id),
        user: { id: user.id, name: user.name, role: user.role },
      },
      201,
    );
  }

  if (method === "post" && url === "/login") {
    const payload = body(config);
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");
    const user = db.users.find((entry) => entry.email === email);

    if (!user || user.password !== password) {
      return ok({ error: { message: "Invalid credentials", status: 401 } }, 401);
    }

    return ok({
      accessToken: fakeToken("access", user.id),
      refreshToken: fakeToken("refresh", user.id),
      user: { id: user.id, name: user.name, role: user.role },
    });
  }

  if (method === "get" && url === "/projects") {
    return ok(db.projects);
  }

  if (method === "post" && url === "/projects") {
    const payload = body(config);
    const project = {
      id: nextId("proj"),
      key: String(payload.key ?? "NEW"),
      name: String(payload.name ?? "Untitled"),
      description: String(payload.description ?? ""),
      status: "active",
      members: [],
      milestones: [],
      sprints: [],
      createdAt: now(),
      updatedAt: now(),
    };
    db.projects.push(project);
    return ok(project, 201);
  }

  const projectIdMatch = url.match(/^\/projects\/([^/]+)$/);
  if (method === "get" && projectIdMatch) {
    const project = db.projects.find((p) => p.id === projectIdMatch[1]);
    return ok(project ?? null, project ? 200 : 404);
  }

  const archiveMatch = url.match(/^\/projects\/([^/]+)\/archive$/);
  if (method === "post" && archiveMatch) {
    const project = db.projects.find((p) => p.id === archiveMatch[1]);
    if (!project) return ok(null, 404);
    project.status = "archived";
    return ok(project);
  }

  const milestoneMatch = url.match(/^\/projects\/([^/]+)\/milestones$/);
  if (method === "post" && milestoneMatch) {
    const payload = body(config);
    const project = db.projects.find((p) => p.id === milestoneMatch[1]);
    if (!project) return ok(null, 404);
    const milestone = { id: nextId("ms"), name: String(payload.name ?? "Milestone"), createdAt: now() };
    project.milestones.push(milestone);
    return ok(milestone, 201);
  }

  const sprintMatch = url.match(/^\/projects\/([^/]+)\/sprints$/);
  if (method === "post" && sprintMatch) {
    const payload = body(config);
    const project = db.projects.find((p) => p.id === sprintMatch[1]);
    if (!project) return ok(null, 404);
    const sprint = { id: nextId("sp"), name: String(payload.name ?? "Sprint"), createdAt: now() };
    project.sprints.push(sprint);
    return ok(sprint, 201);
  }

  const projectIssuesMatch = url.match(/^\/projects\/([^/]+)\/issues$/);
  if (method === "get" && projectIssuesMatch) {
    return ok(db.issues.filter((issue) => issue.projectId === projectIssuesMatch[1]));
  }

  if (method === "post" && projectIssuesMatch) {
    const payload = body(config);
    const issue = {
      id: nextId("iss"),
      projectId: projectIssuesMatch[1],
      number: db.issues.length + 1,
      title: String(payload.title ?? "Untitled"),
      priority: "medium",
      statusId: "todo",
      createdAt: now(),
      updatedAt: now(),
    };
    db.issues.push(issue);
    return ok(issue, 201);
  }

  const issueStatusMatch = url.match(/^\/issues\/([^/]+)\/status$/);
  if (method === "patch" && issueStatusMatch) {
    const payload = body(config);
    const issue = db.issues.find((item) => item.id === issueStatusMatch[1]);
    if (!issue) return ok(null, 404);
    issue.statusId = String(payload.statusId ?? issue.statusId);
    issue.updatedAt = now();
    return ok(issue);
  }

  if (method === "get" && url === "/dashboard") {
    const totals = {
      projects: db.projects.length,
      issues: db.issues.length,
      notifications: db.notifications.length,
      milestones: db.projects.reduce((sum, project) => sum + project.milestones.length, 0),
    };
    return ok({
      totals,
      statusBreakdown: db.statuses.map((statusId) => ({
        statusId,
        count: db.issues.filter((issue) => issue.statusId === statusId).length,
      })),
      openIssues: db.issues.filter((issue) => issue.statusId !== "done"),
      overdueIssues: [],
    });
  }

  return ok(null, 404);
};
