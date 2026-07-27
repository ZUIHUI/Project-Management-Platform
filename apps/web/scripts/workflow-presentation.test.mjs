import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWorkflowStatusOptions,
  getCanonicalWorkflowStatusId,
  getIssuePriorityPresentation,
  getWorkflowTransitionTargets,
  getWorkflowStatusLabel,
  getWorkflowStatusTone,
  isCoreWorkflowReady,
} from "../src/features/issue/workflowPresentation.js";

test("standard workflow labels are localized without changing stable IDs", () => {
  const options = buildWorkflowStatusOptions([
    { id: "todo", name: "Todo" },
    { id: "doing", name: "In Progress" },
    { id: "done", name: "Done" },
  ]);

  assert.deepEqual(options, [
    { id: "todo", label: "待處理", allowedToIds: ["doing"] },
    { id: "doing", label: "進行中", allowedToIds: ["todo", "done"] },
    { id: "done", label: "已完成", allowedToIds: ["doing"] },
  ]);
});

test("transition targets follow the API contract instead of array adjacency", () => {
  const statuses = buildWorkflowStatusOptions([
    { id: "todo", name: "Todo", allowedToIds: ["doing"] },
    { id: "doing", name: "In Progress", allowedToIds: ["todo", "done"] },
    { id: "done", name: "Done", allowedToIds: ["doing"] },
  ]);

  assert.deepEqual(
    getWorkflowTransitionTargets(statuses, "todo").map((status) => status.id),
    ["doing"],
  );
  assert.deepEqual(
    getWorkflowTransitionTargets(statuses, "doing").map((status) => status.id),
    ["todo", "done"],
  );
  assert.deepEqual(getWorkflowTransitionTargets(statuses, "unknown"), []);
});

test("custom workflow labels remain contract-backed", () => {
  const status = { id: "quality-review", name: "品質審查" };
  assert.equal(getWorkflowStatusLabel(status), "品質審查");
  assert.equal(getWorkflowStatusTone(status, [{ id: "todo" }, status, { id: "done" }]), "brand");
});

test("legacy display names normalize only in the presentation layer", () => {
  assert.equal(getCanonicalWorkflowStatusId("In Progress"), "doing");
  assert.equal(getWorkflowStatusLabel("Done"), "已完成");
  assert.equal(getWorkflowStatusTone("doing"), "brand");
  assert.deepEqual(getIssuePriorityPresentation("high"), {
    label: "高優先",
    shortLabel: "高",
    tone: "danger",
  });
});

test("core workflow readiness requires every canonical status in contract order", () => {
  assert.equal(isCoreWorkflowReady([
    { id: "todo", order: 1, allowedToIds: ["doing"] },
    { id: "doing", order: 2, allowedToIds: ["todo", "done"] },
    { id: "done", order: 3, allowedToIds: ["doing"] },
  ]), true);
  assert.equal(isCoreWorkflowReady([
    { id: "todo", order: 1, allowedToIds: ["doing"] },
    { id: "done", order: 2, allowedToIds: ["doing"] },
  ]), false);
  assert.equal(isCoreWorkflowReady([
    { id: "todo", order: 2, allowedToIds: ["doing"] },
    { id: "doing", order: 1, allowedToIds: ["todo", "done"] },
    { id: "done", order: 3, allowedToIds: ["doing"] },
  ]), false);
  assert.equal(isCoreWorkflowReady([
    { id: "todo", order: 1 },
    { id: "doing", order: 2, allowedToIds: ["todo", "done"] },
    { id: "done", order: 3, allowedToIds: ["doing"] },
  ]), false);
});
