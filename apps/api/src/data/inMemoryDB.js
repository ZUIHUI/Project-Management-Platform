import { STATUS } from "../config/constants.js";
import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const DATA_FILE = fileURLToPath(new URL("./runtime-db.json", import.meta.url));

const now = () => new Date().toISOString();

const buildSeedDb = () => ({
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
    { id: STATUS.TODO, name: "Todo", category: "todo", order: 1 },
    { id: STATUS.DOING, name: "Doing", category: "doing", order: 2 },
    { id: STATUS.DONE, name: "Done", category: "done", order: 3 },
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
});

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const loadPersistedDb = () => {
  if (!existsSync(DATA_FILE)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    console.warn("[inMemoryDB] Failed to parse runtime-db.json, fallback to seed data", error);
    return null;
  }
};

const seedDb = buildSeedDb();
const persisted = loadPersistedDb();

const mergeDb = () => {
  if (!persisted) {
    return deepClone(seedDb);
  }

  const merged = deepClone(seedDb);
  Object.keys(merged).forEach((key) => {
    if (persisted[key] !== undefined) {
      merged[key] = persisted[key];
    }
  });

  return merged;
};

export const db = mergeDb();

export const persistDb = () => {
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
};

persistDb();

export const idFactory = (prefix) => `${prefix}-${randomUUID()}`;
