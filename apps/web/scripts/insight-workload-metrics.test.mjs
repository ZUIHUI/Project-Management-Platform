import assert from "node:assert/strict";
import test from "node:test";
import { deriveAssigneeCompletion } from "../src/features/insight/insightMetrics.ts";
import { deriveWorkloadMetrics } from "../src/features/workload/workloadMetrics.ts";

const task = (id, statusId, assignee) => ({
  id,
  number: Number(id.replace(/\D/g, "")) || 1,
  projectId: "project-1",
  title: `Issue ${id}`,
  description: "",
  priority: "medium",
  statusId,
  assigneeId: assignee,
  reporterId: null,
  dueAt: null,
  createdAt: "2026-07-22T00:00:00.000Z",
  updatedAt: "2026-07-22T00:00:00.000Z",
  statusLabel: statusId,
  assignee,
  assigneeLabel: assignee,
  dueDate: null,
});

const team = [
  { id: "user-pm", name: "PM", email: "pm@example.com", role: "project_admin" },
  { id: "user-dev", name: "Developer", email: "dev@example.com", role: "member" },
];

test("insight assignee distribution uses the shared readable team identity", () => {
  const result = deriveAssigneeCompletion([
    task("issue-1", "done", "user-pm"),
    task("issue-2", "todo", "user-pm"),
  ], team);

  assert.deepEqual(result, [{
    id: "user-pm",
    name: "PM",
    email: "pm@example.com",
    total: 2,
    completed: 1,
    completionRate: 50,
  }]);
});

test("insight assignee distribution retains an ID fallback for removed members", () => {
  assert.deepEqual(deriveAssigneeCompletion([
    task("issue-3", "done", "removed-user"),
  ], team), [{
    id: "removed-user",
    name: "removed-user",
    email: "",
    total: 1,
    completed: 1,
    completionRate: 100,
  }]);
});

test("workload and insight projections resolve the same member identity", () => {
  const workload = deriveWorkloadMetrics([
    task("issue-4", "doing", "user-dev"),
  ], team);

  assert.equal(workload.members.find((member) => member.id === "user-dev")?.name, "Developer");
  assert.equal(workload.members.find((member) => member.id === "user-dev")?.email, "dev@example.com");
});
