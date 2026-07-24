import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startTestServer, stopTestServer, testPort } from "./test-server.mjs";

let baseUrl;

const assertErrorShape = (body, status) => {
  assert.equal(typeof body?.error?.message, "string");
  assert.equal(body?.error?.status, status);
};

const run = async () => {
  const server = await startTestServer(testPort("CONTRACT_TEST_PORT", 3101));
  baseUrl = server.baseUrl;

  try {
    const specRes = await fetch(`${baseUrl}/openapi.yaml`);
    assert.equal(specRes.status, 200);
    const specText = await specRes.text();
    assert.match(specText, /openapi: 3\.1\.0/);
    assert.match(specText, /dueAt/);

    const loginRes = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "pm@example.com", password: "password" }),
    });
    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    const token = loginBody.accessToken;
    assert.ok(token);
    const auth = { Authorization: `Bearer ${token}` };

    const createIssueRes = await fetch(`${baseUrl}/projects/proj-1/issues`, {
      method: "POST",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ title: "Contract test issue", dueDate: "2026-12-31T00:00:00.000Z" }),
    });
    assert.equal(createIssueRes.status, 201);
    const issueBody = await createIssueRes.json();
    assert.equal(issueBody.data.title, "Contract test issue");
    assert.equal(issueBody.data.dueAt, "2026-12-31T00:00:00.000Z");
    assert.equal("dueDate" in issueBody.data, false);

    const issueId = issueBody.data.id;

    const assignIssueRes = await fetch(`${baseUrl}/issues/${issueId}/assignee`, {
      method: "PATCH",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ assigneeId: "user-dev" }),
    });
    assert.equal(assignIssueRes.status, 200);

    const activityRes = await fetch(`${baseUrl}/activity-logs`, { headers: auth });
    assert.equal(activityRes.status, 200);
    const activityBody = await activityRes.json();
    const assignmentActivity = activityBody.data.find(
      (activity) => activity.issueId === issueId && activity.action === "issue.assigned",
    );
    assert.ok(assignmentActivity, "assignment should create an activity projection");
    assert.deepEqual(assignmentActivity.userReferences, [{
      id: "user-dev",
      name: "Developer",
    }]);

    const dashboardRes = await fetch(`${baseUrl}/dashboard`, { headers: auth });
    assert.equal(dashboardRes.status, 200);
    const dashboard = (await dashboardRes.json()).data;
    assert.deepEqual(
      dashboard.statusBreakdown.map((item) => item.statusId),
      ["todo", "doing", "done"],
      "dashboard status breakdown must follow workflow order",
    );
    assert.equal(
      dashboard.statusBreakdown.every((item) => typeof item.statusName === "string" && item.statusName.length > 0),
      true,
      "dashboard status breakdown must expose readable workflow names",
    );
    const dashboardIssue = dashboard.openIssues.find((item) => item.id === issueId);
    assert.ok(dashboardIssue, "new open Issue should appear in the dashboard projection");
    assert.equal(dashboardIssue.projectKey, "CORE");
    assert.equal(dashboardIssue.projectName, "Core Refactor");
    assert.equal("dueDate" in dashboardIssue, false);

    const listRes = await fetch(`${baseUrl}/projects/proj-1/issues?page=1&pageSize=10`, { headers: auth });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(Array.isArray(listBody.data), true);
    assert.equal(typeof listBody.meta.page, "number");

    const timelineRes = await fetch(`${baseUrl}/projects/proj-1/timeline`, { headers: auth });
    assert.equal(timelineRes.status, 200);
    const timelineBody = await timelineRes.json();
    assert.equal(timelineBody.data.project.id, "proj-1");
    assert.equal(Array.isArray(timelineBody.data.items), true);
    assert.equal(typeof timelineBody.meta.lastSync, "string");

    const badTransitionRes = await fetch(`${baseUrl}/issues/${issueId}/status`, {
      method: "PATCH",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ statusId: "done" }),
    });
    assert.equal(badTransitionRes.status, 422);
    assertErrorShape(await badTransitionRes.json(), 422);

    const validTransitionRes = await fetch(`${baseUrl}/issues/${issueId}/status`, {
      method: "PATCH",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ statusId: "doing" }),
    });
    assert.equal(validTransitionRes.status, 200);

    const devLoginRes = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "dev@example.com", password: "password" }),
    });
    assert.equal(devLoginRes.status, 200);
    const devLoginBody = await devLoginRes.json();
    const devAuth = { Authorization: `Bearer ${devLoginBody.accessToken}` };
    const devNotificationsRes = await fetch(`${baseUrl}/notifications`, { headers: devAuth });
    assert.equal(devNotificationsRes.status, 200);
    const devNotificationsBody = await devNotificationsRes.json();
    const workflowNotification = devNotificationsBody.data.find(
      (notification) => notification.type === "workflow_status_changed"
        && notification.payload?.issueId === issueId,
    );
    assert.ok(workflowNotification, "a status change should notify a different assignee");
    assert.equal(workflowNotification.payload.fromStatusId, "todo");
    assert.equal(workflowNotification.payload.toStatusId, "doing");
    assert.equal(workflowNotification.payload.projectId, "proj-1");

    const outsiderLoginRes = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Outsider",
        email: `outsider_${randomUUID()}@example.com`,
        password: "Password1",
        role: "owner",
      }),
    });
    assert.equal(outsiderLoginRes.status, 201);
    const outsider = await outsiderLoginRes.json();
    assert.equal(outsider.user.role, "project_admin");
    const outsiderAuth = { Authorization: `Bearer ${outsider.accessToken}` };

    const forbiddenRes = await fetch(`${baseUrl}/projects/proj-1`, { headers: outsiderAuth });
    assert.equal(forbiddenRes.status, 403);
    assertErrorShape(await forbiddenRes.json(), 403);

    const legacyRes = await fetch(`${baseUrl}/tasks`, { headers: auth });
    assert.equal(legacyRes.status, 200);
    assert.equal(legacyRes.headers.get("deprecation"), "true");
    const legacyBody = await legacyRes.json();
    assert.equal("dueDate" in legacyBody.data[0], true);

    console.log("Contract test passed");
  } finally {
    await stopTestServer(server.child);
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
