import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const baseUrl = 'http://127.0.0.1:3000/api/v1';
const rootDir = fileURLToPath(new URL('../', import.meta.url));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForServer = async () => {
  for (let i = 0; i < 30; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {}
    await wait(200);
  }
  throw new Error('API server did not start in time');
};

const login = async (email, password) => {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  return body.accessToken;
};

const run = async () => {
  const child = spawn('node', ['src/index.js'], { cwd: rootDir, stdio: 'inherit' });
  try {
    await waitForServer();

    const pmToken = await login('pm@example.com', 'password');
    const pmHeaders = { Authorization: `Bearer ${pmToken}`, 'content-type': 'application/json' };

    // auth integration
    const meRes = await fetch(`${baseUrl}/me`, { headers: { Authorization: `Bearer ${pmToken}` } });
    assert.equal(meRes.status, 200);

    // project scope integration: outsider must be forbidden
    const registerRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Scope Outsider', email: `scope-outsider_${Date.now()}@example.com`, password: 'Password1', role: 'member' }),
    });
    assert.equal(registerRes.status, 201);
    const outsider = await registerRes.json();

    const forbiddenRes = await fetch(`${baseUrl}/projects/proj-1`, { headers: { Authorization: `Bearer ${outsider.accessToken}` } });
    assert.equal(forbiddenRes.status, 403);

    // workflow transition integration
    const createRes = await fetch(`${baseUrl}/projects/proj-1/issues`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ title: 'Integration transition issue' }),
    });
    assert.equal(createRes.status, 201);
    const issue = (await createRes.json()).data;

    const invalidTransitionRes = await fetch(`${baseUrl}/issues/${issue.id}/status`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ statusId: 'done' }),
    });
    assert.equal(invalidTransitionRes.status, 422);

    const toDoingRes = await fetch(`${baseUrl}/issues/${issue.id}/status`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ statusId: 'doing' }),
    });
    assert.equal(toDoingRes.status, 200);

    const toDoneRes = await fetch(`${baseUrl}/issues/${issue.id}/status`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ statusId: 'done' }),
    });
    assert.equal(toDoneRes.status, 200);

    console.log('Integration tests passed');
  } finally {
    child.kill('SIGTERM');
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
