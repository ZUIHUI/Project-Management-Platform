import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWorkflowStatusOptions,
  getCanonicalWorkflowStatusId,
  getIssuePriorityPresentation,
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
    { id: "todo", label: "待處理" },
    { id: "doing", label: "進行中" },
    { id: "done", label: "已完成" },
  ]);
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
    { id: "todo", order: 1 },
    { id: "doing", order: 2 },
    { id: "done", order: 3 },
  ]), true);
  assert.equal(isCoreWorkflowReady([
    { id: "todo", order: 1 },
    { id: "done", order: 2 },
  ]), false);
  assert.equal(isCoreWorkflowReady([
    { id: "todo", order: 2 },
    { id: "doing", order: 1 },
    { id: "done", order: 3 },
  ]), false);
});
