import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { startTestServer, stopTestServer, testPort } from "./test-server.mjs";

let baseUrl;

const run = async () => {
  const server = await startTestServer(testPort("SMOKE_TEST_PORT", 3103));
  baseUrl = server.baseUrl;

  try {
    // Verify auth endpoint
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "pm@example.com", password: "password" }),
    });
    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    const token = loginBody.accessToken || loginBody.data?.accessToken;
    assert.ok(token, "access token is required");

    const authHeader = { Authorization: `Bearer ${token}` };

    const projectsRes = await fetch(`${baseUrl}/projects`, { headers: authHeader });
    assert.equal(projectsRes.status, 200);
    const projectId = "proj-1";

    const createProjectRes = await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ key: `PL${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`, name: "Planning" }),
    });
    assert.equal(createProjectRes.status, 201);

    const milestoneRes = await fetch(`${baseUrl}/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ name: "Smoke milestone" }),
    });
    assert.equal(milestoneRes.status, 201);

    const sprintRes = await fetch(`${baseUrl}/projects/${projectId}/sprints`, {
      method: "POST",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ name: "Smoke sprint" }),
    });
    assert.equal(sprintRes.status, 201);

    const createIssueRes = await fetch(`${baseUrl}/projects/${projectId}/issues`, {
      method: "POST",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ title: "Smoke test issue", reporterId: "user-dev" }),
    });
    assert.equal(createIssueRes.status, 201);
    const createIssueBody = await createIssueRes.json();
    assert.equal(createIssueBody.data.reporterId, "user-pm");
    const issueId = createIssueBody.data.id;

    const assignRes = await fetch(`${baseUrl}/issues/${issueId}/assignee`, {
      method: "PATCH",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ assigneeId: "user-pm" }),
    });
    assert.equal(assignRes.status, 200);

    const statusTransitionRes = await fetch(`${baseUrl}/issues/${issueId}/status`, {
      method: "PATCH",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ statusId: "doing" }),
    });
    assert.equal(statusTransitionRes.status, 200);

    const commentRes = await fetch(`${baseUrl}/issues/${issueId}/comments`, {
      method: "POST",
      headers: { ...authHeader, "content-type": "application/json" },
      body: JSON.stringify({ body: "Looks good", authorId: "user-dev" }),
    });
    assert.equal(commentRes.status, 201);
    assert.equal((await commentRes.json()).data.authorId, "user-pm");

    const boardRes = await fetch(`${baseUrl}/projects/${projectId}/board`, { headers: authHeader });
    assert.equal(boardRes.status, 200);

    const timelineRes = await fetch(`${baseUrl}/projects/${projectId}/timeline`, { headers: authHeader });
    assert.equal(timelineRes.status, 200);

    const dashboardRes = await fetch(`${baseUrl}/dashboard`, { headers: authHeader });
    assert.equal(dashboardRes.status, 200);

    const legacyRes = await fetch(`${baseUrl}/tasks`, { headers: authHeader });
    assert.equal(legacyRes.status, 200);
    assert.equal(legacyRes.headers.get("deprecation"), "true");

    const notificationsRes = await fetch(`${baseUrl}/notifications`, { headers: authHeader });
    assert.equal(notificationsRes.status, 200);
    const notificationsBody = await notificationsRes.json();
    const firstNotification = notificationsBody.data[0];

    if (firstNotification) {
      const markReadRes = await fetch(`${baseUrl}/notifications/${firstNotification.id}/read`, {
        method: "PATCH",
        headers: authHeader,
      });
      assert.equal(markReadRes.status, 200);
    }

    const activityRes = await fetch(`${baseUrl}/activity-logs`, {
      headers: authHeader,
    });
    assert.equal(activityRes.status, 200);

    console.log("Smoke test passed");
  } finally {
    await stopTestServer(server.child);
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
