import assert from "node:assert/strict";
import { store } from "../src/data/store.js";
import dashboardRoutes from "../src/domain/dashboard/dashboard.routes.js";
import notificationsRoutes from "../src/domain/notification/notification.routes.js";
import projectsRoutes from "../src/domain/project/project.routes.js";
import issuesRoutes from "../src/domain/issue/issue.routes.js";

const routes = [dashboardRoutes, notificationsRoutes, projectsRoutes, issuesRoutes];

assert.ok(Array.isArray(store.projects), "store.projects must be array");
assert.ok(Array.isArray(store.tasks), "store.tasks must be array");
assert.ok(Array.isArray(store.notifications), "store.notifications must be array");

assert.equal(typeof dashboardRoutes, "function", "dashboard route should be express router");
assert.equal(typeof notificationsRoutes, "function", "notifications route should be express router");
assert.equal(typeof projectsRoutes, "function", "projects route should be express router");
assert.equal(typeof issuesRoutes, "function", "issues route should be express router");

assert.ok(Array.isArray(routes), "legacy routes export should be array");
assert.ok(routes.length >= 4, "legacy routes should include compatibility routes");

console.log("Legacy compatibility verification passed");
