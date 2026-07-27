import assert from "node:assert/strict";
import test from "node:test";
import { buildWorkflowStatuses } from "../src/application/issue/issueWorkflow.ts";

const statuses = [
  { id: "todo", name: "Todo", order: 1 },
  { id: "doing", name: "In Progress", order: 2 },
  { id: "done", name: "Done", order: 3 },
];

test("projects legal workflow targets in status order", () => {
  assert.deepEqual(buildWorkflowStatuses(statuses, [
    { fromStatusId: "doing", toStatusId: "done" },
    { fromStatusId: "todo", toStatusId: "doing" },
    { fromStatusId: "doing", toStatusId: "todo" },
    { fromStatusId: "done", toStatusId: "doing" },
  ]), [
    { ...statuses[0], allowedToIds: ["doing"] },
    { ...statuses[1], allowedToIds: ["todo", "done"] },
    { ...statuses[2], allowedToIds: ["doing"] },
  ]);
});

test("deduplicates targets and ignores transitions outside the published workflow", () => {
  const result = buildWorkflowStatuses(statuses, [
    { fromStatusId: "todo", toStatusId: "doing" },
    { fromStatusId: "todo", toStatusId: "doing" },
    { fromStatusId: "todo", toStatusId: "unknown" },
    { fromStatusId: "unknown", toStatusId: "todo" },
  ]);

  assert.deepEqual(result.map((status) => status.allowedToIds), [["doing"], [], []]);
});
