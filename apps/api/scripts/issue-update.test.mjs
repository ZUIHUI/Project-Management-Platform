import assert from "node:assert/strict";
import test from "node:test";
import { prepareIssueUpdate } from "../src/application/issue/issueUpdate.ts";

const currentIssue = {
  title: "Complete UX verification",
  description: "Verify assignment and notification behavior.",
  priority: "high",
  dueDate: new Date("2030-01-02T00:00:00.000Z"),
  sprintId: "sprint-1",
  milestoneId: "milestone-1",
  assigneeId: "user-member",
};

test("treats an unchanged generic Issue save as a no-op", () => {
  assert.deepEqual(prepareIssueUpdate(currentIssue, {
    title: currentIssue.title,
    description: currentIssue.description,
    priority: currentIssue.priority,
    dueAt: currentIssue.dueDate.toISOString(),
    sprintId: currentIssue.sprintId,
    milestoneId: currentIssue.milestoneId,
    assigneeId: currentIssue.assigneeId,
  }), {
    data: currentIssue,
    changed: false,
  });
});

test("preserves omitted fields but allows nullable fields to be cleared", () => {
  const plan = prepareIssueUpdate(currentIssue, {
    assigneeId: null,
    dueAt: null,
    sprintId: null,
    milestoneId: null,
  });

  assert.equal("error" in plan, false);
  assert.equal(plan.changed, true);
  assert.equal(plan.data.title, currentIssue.title);
  assert.equal(plan.data.assigneeId, null);
  assert.equal(plan.data.dueDate, null);
  assert.equal(plan.data.sprintId, null);
  assert.equal(plan.data.milestoneId, null);
});

test("normalizes editable text and rejects invalid required or date values", () => {
  const normalized = prepareIssueUpdate(currentIssue, {
    title: "  Updated title  ",
    description: "  Updated description  ",
  });
  assert.equal("error" in normalized, false);
  assert.equal(normalized.data.title, "Updated title");
  assert.equal(normalized.data.description, "Updated description");

  assert.deepEqual(prepareIssueUpdate(currentIssue, { title: "   " }), {
    error: "title is required",
    status: 422,
  });
  assert.deepEqual(prepareIssueUpdate(currentIssue, { dueAt: "not-a-date" }), {
    error: "dueAt must be a valid date",
    status: 422,
  });
});
