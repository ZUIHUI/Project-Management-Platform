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
const validPassword = (password: string) => password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
const parseBearerToken = (config: AxiosRequestConfig) => {
  const authHeader = (config.headers?.Authorization ?? config.headers?.authorization ?? "") as string;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const parts = token.split("-");
  if (parts.length < 3) return null;
  return parts.slice(1, -1).join("-");
};
const getCurrentUser = (config: AxiosRequestConfig) => {
  const userId = parseBearerToken(config);
  if (!userId) return null;
  return db.users.find((user) => user.id === userId) ?? null;
};

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

    if (name.length < 2 || !validPassword(password)) {
      return ok({ error: { message: "密碼需為 8-64 字元，且至少包含 1 個大寫英文字母、1 個小寫英文字母、1 個數字", status: 422 } }, 422);
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
  if (method === "get" && url === "/me") {
    const user = getCurrentUser(config);
    if (!user) {
      return ok({ error: { message: "Unauthorized: Missing token", status: 401 } }, 401);
    }
    return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }

  if (method === "put" && url === "/me") {
    const user = getCurrentUser(config);
    if (!user) {
      return ok({ error: { message: "Unauthorized: Missing token", status: 401 } }, 401);
    }
    const payload = body(config);
    const name = String(payload.name ?? "").trim();
    const email = String(payload.email ?? "").trim().toLowerCase();
    if (!name || name.length < 2) {
      return ok({ error: { message: "Name must be at least 2 characters", status: 422 } }, 422);
    }
    if (!email.includes("@")) {
      return ok({ error: { message: "A valid email is required", status: 422 } }, 422);
    }
    if (db.users.some((entry) => entry.email === email && entry.id !== user.id)) {
      return ok({ error: { message: "Email already in use", status: 409 } }, 409);
    }
    user.name = name;
    user.email = email;
    return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }

  if (method === "post" && url === "/change-password") {
    const payload = body(config);
    const currentPassword = String(payload.currentPassword ?? "");
    const newPassword = String(payload.newPassword ?? "");
    const user = db.users[0];

    if (user.password !== currentPassword) {
      return ok({ error: { message: "Current password is incorrect", status: 401 } }, 401);
    }

    if (!validPassword(newPassword)) {
      return ok({ error: { message: "密碼需為 8-64 字元，且至少包含 1 個大寫英文字母、1 個小寫英文字母、1 個數字", status: 422 } }, 422);
    }

    user.password = newPassword;
    return ok({ message: "Password updated" });
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

  if (method === "get" && url === "/notifications") {
    const user = getCurrentUser(config);
    if (!user) {
      return ok({ error: { message: "Unauthorized: Missing token", status: 401 } }, 401);
    }
    return ok(db.notifications.filter((item) => item.userId === user.id));
  }

  if (method === "post" && url === "/notifications") {
    const payload = body(config);
    const item = {
      id: nextId("noti"),
      userId: String(payload.userId ?? getCurrentUser(config)?.id ?? db.users[0].id),
      type: String(payload.type ?? "system"),
      message: String(payload.message ?? ""),
      read: false,
      createdAt: now(),
    };
    db.notifications.unshift(item);
    return ok(item, 201);
  }

  const markReadMatch = url.match(/^\/notifications\/([^/]+)\/read$/);
  if (method === "patch" && markReadMatch) {
    const item = db.notifications.find((entry) => entry.id === markReadMatch[1]);
    if (!item) return ok(null, 404);
    item.read = true;
    return ok(item);
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
