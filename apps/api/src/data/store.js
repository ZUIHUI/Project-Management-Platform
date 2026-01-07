const now = () => new Date().toISOString();

const projects = [
  {
    id: "proj-1",
    name: "Launch Website",
    description: "Design and launch the marketing site.",
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
];

const tasks = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "Create wireframes",
    status: "in-progress",
    priority: "medium",
    dueDate: null,
    createdAt: now(),
    updatedAt: now(),
  },
];

const notifications = [
  {
    id: "note-1",
    title: "Project kickoff",
    message: "The Launch Website project has started.",
    createdAt: now(),
    read: false,
  },
];

const files = [
  {
    id: "file-1",
    name: "requirements.pdf",
    url: "https://example.com/files/requirements.pdf",
    version: 1,
    createdAt: now(),
  },
];

export const store = {
  projects,
  tasks,
  notifications,
  files,
};
