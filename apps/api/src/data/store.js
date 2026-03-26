const now = () => new Date().toISOString();

const users = [
  { id: "user-owner", name: "Owner", email: "owner@example.com", role: "owner" },
  { id: "user-pm", name: "Project Manager", email: "pm@example.com", role: "project_admin" },
  { id: "user-dev", name: "Developer", email: "dev@example.com", role: "member" },
];

const projects = [
  {
    id: "proj-1",
    key: "WEB",
    name: "Launch Website",
    description: "Design and launch the marketing site.",
    status: "active",
    ownerId: "user-pm",
    createdAt: now(),
    updatedAt: now(),
  },
];

const projectMembers = [
  { projectId: "proj-1", userId: "user-pm", role: "project_admin" },
  { projectId: "proj-1", userId: "user-dev", role: "member" },
];

const statuses = [
  { id: "todo", name: "Todo", category: "todo", order: 1 },
  { id: "doing", name: "In Progress", category: "doing", order: 2 },
  { id: "done", name: "Done", category: "done", order: 3 },
];

const workflowTransitions = {
  todo: ["doing"],
  doing: ["todo", "done"],
  done: ["doing"],
};

const issues = [
  {
    id: "iss-1",
    projectId: "proj-1",
    number: 1,
    title: "Create wireframes",
    description: "Draft initial homepage and pricing wireframes.",
    statusId: "doing",
    priority: "medium",
    assigneeId: "user-dev",
    reporterId: "user-pm",
    dueDate: null,
    createdAt: now(),
    updatedAt: now(),
  },
];

const comments = [
  {
    id: "com-1",
    issueId: "iss-1",
    authorId: "user-pm",
    body: "Please upload the first draft before Friday.",
    createdAt: now(),
  },
];

const notifications = [
  {
    id: "note-1",
    userId: "user-dev",
    type: "issue.assigned",
    title: "Issue assigned",
    message: "You were assigned WEB-1",
    createdAt: now(),
    read: false,
  },
];

const activityLogs = [
  {
    id: "act-1",
    actorId: "user-pm",
    entityType: "issue",
    entityId: "iss-1",
    action: "issue.created",
    before: null,
    after: { statusId: "doing" },
    createdAt: now(),
  },
];

const files = [
  {
    id: "file-1",
    issueId: "iss-1",
    name: "requirements.pdf",
    url: "https://example.com/files/requirements.pdf",
    version: 1,
    createdAt: now(),
  },
];

export const store = {
  users,
  projects,
  projectMembers,
  statuses,
  workflowTransitions,
  issues,
  comments,
  notifications,
  activityLogs,
  files,
};
