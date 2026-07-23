import assert from "node:assert/strict";
import test from "node:test";
import { buildProjectPlanningScope } from "../src/features/project/projectWorkspaceState.js";
import { createLatestRequestGuard } from "../src/shared/latestRequestGuard.js";

test("keeps project planning request scopes distinct", () => {
  assert.notEqual(
    buildProjectPlanningScope("project-a", "milestone"),
    buildProjectPlanningScope("project-a", "sprint"),
  );
  assert.notEqual(
    buildProjectPlanningScope("project-a", "sprint"),
    buildProjectPlanningScope("project-b", "sprint"),
  );
});

test("rejects planning results after the project or planning kind changes", () => {
  const guard = createLatestRequestGuard();
  const milestoneScope = buildProjectPlanningScope("project-a", "milestone");
  const sprintScope = buildProjectPlanningScope("project-a", "sprint");
  const oldRequest = guard.begin(milestoneScope);

  assert.equal(guard.isLatest(oldRequest, sprintScope), false);

  const currentRequest = guard.begin(sprintScope);
  assert.equal(guard.isLatest(oldRequest, milestoneScope), false);
  assert.equal(guard.isLatest(currentRequest, sprintScope), true);
});
