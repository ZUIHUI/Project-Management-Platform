import assert from "node:assert/strict";
import test from "node:test";
import { WORKSPACE_ROLE_REQUIREMENTS } from "../src/components/layout/workspaceAccess.js";

test("contract-backed read workspaces are available to viewers", () => {
  const readWorkspaces = [
    "dashboard",
    "board",
    "calendar",
    "timeline",
    "insights",
    "workload",
    "team",
    "notifications",
    "projectIssues",
    "projectBoard",
    "projectSprint",
    "projectMilestone",
  ];

  readWorkspaces.forEach((workspace) => {
    assert.equal(WORKSPACE_ROLE_REQUIREMENTS[workspace], "viewer", workspace);
  });
});

test("global activity keeps the API member boundary", () => {
  assert.equal(WORKSPACE_ROLE_REQUIREMENTS.activity, "member");
});
