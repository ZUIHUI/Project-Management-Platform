import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const baseUrl = "http://127.0.0.1:3000/api/v1";
const rootDir = fileURLToPath(new URL("../", import.meta.url));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = async () => {
  for (let i = 0; i < 20; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // retry
    }
    await wait(250);
  }

  throw new Error("API server did not start in time");
};

const run = async () => {
  const child = spawn("node", ["src/index.js"], { cwd: rootDir, stdio: "inherit" });

  try {
    await waitForServer();

    const projectsRes = await fetch(`${baseUrl}/projects`);
    assert.equal(projectsRes.status, 200);
    const projectsBody = await projectsRes.json();
    const projectId = projectsBody.data[0].id;

    const createProjectRes = await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-role": "project_admin" },
      body: JSON.stringify({ key: "PLN", name: "Planning" }),
    });
    assert.equal(createProjectRes.status, 201);

    const milestoneRes = await fetch(`${baseUrl}/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-role": "member" },
      body: JSON.stringify({ name: "Smoke milestone" }),
    });
    assert.equal(milestoneRes.status, 201);

    const sprintRes = await fetch(`${baseUrl}/projects/${projectId}/sprints`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-role": "member" },
      body: JSON.stringify({ name: "Smoke sprint" }),
    });
    assert.equal(sprintRes.status, 201);

    const createIssueRes = await fetch(`${baseUrl}/projects/${projectId}/issues`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-role": "member" },
      body: JSON.stringify({ title: "Smoke test issue", reporterId: "user-pm" }),
    });
    assert.equal(createIssueRes.status, 201);
    const createIssueBody = await createIssueRes.json();
    const issueId = createIssueBody.data.id;

    const assignRes = await fetch(`${baseUrl}/issues/${issueId}/assignee`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-role": "member" },
      body: JSON.stringify({ assigneeId: "user-dev" }),
    });
    assert.equal(assignRes.status, 200);

    const statusTransitionRes = await fetch(`${baseUrl}/issues/${issueId}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-role": "member" },
      body: JSON.stringify({ statusId: "doing" }),
    });
    assert.equal(statusTransitionRes.status, 200);

    const commentRes = await fetch(`${baseUrl}/issues/${issueId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-role": "member" },
      body: JSON.stringify({ body: "Looks good", authorId: "user-dev" }),
    });
    assert.equal(commentRes.status, 201);

    const boardRes = await fetch(`${baseUrl}/projects/${projectId}/board`);
    assert.equal(boardRes.status, 200);

    const dashboardRes = await fetch(`${baseUrl}/dashboard`);
    assert.equal(dashboardRes.status, 200);

    const legacyRes = await fetch(`${baseUrl}/tasks`);
    assert.equal(legacyRes.status, 200);
    assert.equal(legacyRes.headers.get("deprecation"), "true");

    const notificationsRes = await fetch(`${baseUrl}/notifications`);
    assert.equal(notificationsRes.status, 200);
    const notificationsBody = await notificationsRes.json();
    const firstNotification = notificationsBody.data[0];

    if (firstNotification) {
      const markReadRes = await fetch(`${baseUrl}/notifications/${firstNotification.id}/read`, {
        method: "PATCH",
      });
      assert.equal(markReadRes.status, 200);
    }

    const activityRes = await fetch(`${baseUrl}/activity-logs`, {
      headers: { "x-role": "member" },
    });
    assert.equal(activityRes.status, 200);

    console.log("Smoke test passed");
  } finally {
    child.kill("SIGTERM");
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
