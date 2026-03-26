// Compatibility bridge for legacy branches.
// New source of truth is `inMemoryDB.js`.
import { db } from "./inMemoryDB.js";

export const store = {
  projects: db.projects,
  tasks: db.issues,
  notifications: db.notifications,
  files: [],
};
