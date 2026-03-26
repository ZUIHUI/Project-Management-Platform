import { STATUS } from "../config/constants.js";

const now = () => new Date().toISOString();

export const db = {
  users: [
    { id: "user-owner", name: "Owner", email: "owner@example.com", role: "owner", password: "$2b$10$TToBgUlW0lz70sAAZBxyF.cnDQZLSwITS0nkMihoHF3z8s4GbH2dq" }, // password: "password"
    { id: "user-pm", name: "PM", email: "pm@example.com", role: "project_admin", password: "$2b$10$TToBgUlW0lz70sAAZBxyF.cnDQZLSwITS0nkMihoHF3z8s4GbH2dq" },
    { id: "user-dev", name: "Developer", email: "dev@example.com", role: "member", password: "$2b$10$TToBgUlW0lz70sAAZBxyF.cnDQZLSwITS0nkMihoHF3z8s4GbH2dq" },
  ],
  projects: [
    {
      id: "proj-1",
      key: "CORE",
      name: "Core Refactor",
      description: "Strict rewrite based on spec.",
      ownerId: "user-pm",
      status: "active",
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  projectMembers: [
    { projectId: "proj-1", userId: "user-pm", role: "project_admin" },
    { projectId: "proj-1", userId: "user-dev", role: "member" },
  ],
  milestones: [
    {
      id: "ms-1",
      projectId: "proj-1",
      name: "MVP API ready",
      dueAt: null,
      status: "open",
      createdAt: now(),
    },
  ],
  sprints: [
    {
      id: "sp-1",
      projectId: "proj-1",
      name: "Sprint 1",
      goal: "Issue flow baseline",
      startAt: now(),
      endAt: null,
      status: "active",
      createdAt: now(),
    },
  ],
  statuses: [
    { id: STATUS.TODO, name: "Todo", order: 1 },
    { id: STATUS.DOING, name: "Doing", order: 2 },
    { id: STATUS.DONE, name: "Done", order: 3 },
  ],
  transitions: {
    [STATUS.TODO]: [STATUS.DOING],
    [STATUS.DOING]: [STATUS.TODO, STATUS.DONE],
    [STATUS.DONE]: [STATUS.DOING],
  },
  issues: [],
  comments: [],
  notifications: [],
  activityLogs: [],
};

export const idFactory = (() => {
  let sequence = 1;
  return (prefix) => `${prefix}-${sequence++}`;
})();
