import assert from "node:assert/strict";
import test from "node:test";
import {
  buildIssueViewHref,
  isIssueCollectionPending,
  resolveLinkedIssueState,
  withIssueSelection,
} from "../src/features/issue/issueRouteState.js";
import { createLatestRequestGuard } from "../src/shared/latestRequestGuard.js";

test("preserves unrelated query parameters while updating Issue selection", () => {
  assert.equal(withIssueSelection("sort=updated&issue=old", "new").toString(), "sort=updated&issue=new");
  assert.equal(withIssueSelection("sort=updated&issue=old", "").toString(), "sort=updated");
});

test("keeps the selected Issue when switching list and board views", () => {
  assert.equal(
    buildIssueViewHref("project 1", "board", "issue/2"),
    "/projects/project%201/board?issue=issue%2F2",
  );
  assert.equal(buildIssueViewHref("", "list", "issue-2"), "/projects");
});

test("distinguishes pending, valid, and invalid Issue deep links", () => {
  const issues = [{ id: "issue-1" }];
  assert.equal(resolveLinkedIssueState("", issues, false), "none");
  assert.equal(resolveLinkedIssueState("issue-1", [], true), "pending");
  assert.equal(resolveLinkedIssueState("issue-1", issues, false), "valid");
  assert.equal(resolveLinkedIssueState("missing", issues, false), "invalid");
});

test("keeps a deep link pending until the current project collection is resolved", () => {
  assert.equal(isIssueCollectionPending("project-1", "", false), true);
  assert.equal(isIssueCollectionPending("project-1", "project-2", false), true);
  assert.equal(isIssueCollectionPending("project-1", "project-1", true), true);
  assert.equal(isIssueCollectionPending("project-1", "project-1", false), false);
});

test("accepts results only from the latest request in the current scope", () => {
  const guard = createLatestRequestGuard();
  const first = guard.begin("project-a");
  const second = guard.begin("project-b");
  assert.equal(guard.isLatest(first, "project-a"), false);
  assert.equal(guard.isLatest(second, "project-a"), false);
  assert.equal(guard.isLatest(second, "project-b"), true);
  guard.invalidate();
  assert.equal(guard.isLatest(second, "project-b"), false);
});
