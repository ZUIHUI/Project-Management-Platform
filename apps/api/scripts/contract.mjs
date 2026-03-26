import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const baseUrl = "http://127.0.0.1:3000/api/v1";
const rootDir = fileURLToPath(new URL("../", import.meta.url));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = async () => {
  for (let i = 0; i < 30; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // retry
    }
    await wait(200);
  }

  throw new Error("API server did not start in time");
};

const assertErrorShape = (body, status) => {
  assert.equal(typeof body?.error?.message, "string");
  assert.equal(body?.error?.status, status);
};

const run = async () => {
  const child = spawn("node", ["src/index.js"], { cwd: rootDir, stdio: "inherit" });

  try {
    await waitForServer();

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

    const listRes = await fetch(`${baseUrl}/projects/proj-1/issues?page=1&pageSize=10`, { headers: auth });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(Array.isArray(listBody.data), true);
    assert.equal(typeof listBody.meta.page, "number");

    const badTransitionRes = await fetch(`${baseUrl}/issues/${issueId}/status`, {
      method: "PATCH",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ statusId: "done" }),
    });
    assert.equal(badTransitionRes.status, 422);
    assertErrorShape(await badTransitionRes.json(), 422);

    const outsiderLoginRes = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Outsider",
        email: "outsider@example.com",
        password: "password",
        role: "member",
      }),
    });
    assert.equal(outsiderLoginRes.status, 201);
    const outsider = await outsiderLoginRes.json();
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
    child.kill("SIGTERM");
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
