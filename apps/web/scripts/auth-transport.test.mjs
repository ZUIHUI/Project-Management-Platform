import assert from "node:assert/strict";
import test from "node:test";
import { createAuthAwareFetch } from "../src/shared/api/authTransport.js";

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const ORIGIN = "http://app.test";
const API_BASE_URL = "/api/v1";

const token = (exp, marker) =>
  `x.${Buffer.from(JSON.stringify({ exp, marker })).toString("base64url")}.x`;
const now = () => Math.floor(Date.now() / 1000);
const expiredAccessToken = () => token(now() - 60, "expired-access");
const activeAccessToken = (marker = "active-access") => token(now() + 900, marker);
const activeRefreshToken = () => token(now() + 3600, "active-refresh");

const isTokenExpired = (value) => {
  const payload = JSON.parse(Buffer.from(value.split(".")[1], "base64url").toString("utf8"));
  return payload.exp <= now();
};

const createHarness = ({ accessToken, refreshToken, transport }) => {
  const storage = new Map([
    [ACCESS_KEY, accessToken],
    [REFRESH_KEY, refreshToken],
  ]);
  let invalidations = 0;
  const authFetch = createAuthAwareFetch({
    apiBaseUrl: API_BASE_URL,
    transportFetch: transport,
    accessTokenKey: ACCESS_KEY,
    refreshTokenKey: REFRESH_KEY,
    readToken: (key) => storage.get(key) ?? null,
    isTokenExpired,
    updateAccessToken: (value) => storage.set(ACCESS_KEY, value),
    invalidateSession: () => {
      invalidations += 1;
      storage.clear();
    },
    origin: ORIGIN,
  });
  return { authFetch, storage, getInvalidations: () => invalidations };
};

const asRequest = (input, init) => (input instanceof Request ? input : new Request(input, init));

test("uses an active access token without refreshing", async () => {
  let refreshCalls = 0;
  const currentAccessToken = activeAccessToken();
  const harness = createHarness({
    accessToken: currentAccessToken,
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) refreshCalls += 1;
      assert.equal(request.headers.get("authorization"), `Bearer ${currentAccessToken}`);
      return new Response(null, { status: 200 });
    },
  });

  const response = await harness.authFetch(
    new Request(`${ORIGIN}${API_BASE_URL}/projects`, {
      headers: { authorization: `Bearer ${currentAccessToken}` },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(refreshCalls, 0);
  assert.equal(harness.getInvalidations(), 0);
});

test("returns protected validation failures without refreshing the session", async () => {
  let refreshCalls = 0;
  const currentAccessToken = activeAccessToken();
  const harness = createHarness({
    accessToken: currentAccessToken,
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) refreshCalls += 1;
      return Response.json(
        { error: { message: "Current password is incorrect", status: 422 } },
        { status: 422 },
      );
    },
  });

  const response = await harness.authFetch(
    new Request(`${ORIGIN}${API_BASE_URL}/change-password`, {
      method: "POST",
      headers: { authorization: `Bearer ${currentAccessToken}` },
    }),
  );
  assert.equal(response.status, 422);
  assert.equal(refreshCalls, 0);
  assert.equal(harness.getInvalidations(), 0);
});

test("refreshes an expired access token before the protected request", async () => {
  const refreshedToken = activeAccessToken();
  let refreshCalls = 0;
  let protectedCalls = 0;
  const harness = createHarness({
    accessToken: expiredAccessToken(),
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) {
        refreshCalls += 1;
        return Response.json({ accessToken: refreshedToken });
      }
      protectedCalls += 1;
      assert.equal(request.headers.get("authorization"), `Bearer ${refreshedToken}`);
      return new Response(null, { status: 200 });
    },
  });

  const response = await harness.authFetch(
    new Request(`${ORIGIN}${API_BASE_URL}/projects`, {
      headers: { authorization: "Bearer expired" },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(refreshCalls, 1);
  assert.equal(protectedCalls, 1);
  assert.equal(harness.storage.get(ACCESS_KEY), refreshedToken);
});

test("coalesces concurrent refreshes into one request", async () => {
  const refreshedToken = activeAccessToken();
  let refreshCalls = 0;
  let protectedCalls = 0;
  const harness = createHarness({
    accessToken: expiredAccessToken(),
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) {
        refreshCalls += 1;
        await Promise.resolve();
        return Response.json({ accessToken: refreshedToken });
      }
      protectedCalls += 1;
      assert.equal(request.headers.get("authorization"), `Bearer ${refreshedToken}`);
      return new Response(null, { status: 200 });
    },
  });

  const makeRequest = () =>
    harness.authFetch(
      new Request(`${ORIGIN}${API_BASE_URL}/projects`, {
        headers: { authorization: "Bearer expired" },
      }),
    );
  const responses = await Promise.all([makeRequest(), makeRequest(), makeRequest()]);
  assert.deepEqual(responses.map((response) => response.status), [200, 200, 200]);
  assert.equal(refreshCalls, 1);
  assert.equal(protectedCalls, 3);
});

test("refreshes and retries after a protected request returns 401", async () => {
  const originalToken = activeAccessToken("original-access");
  const refreshedToken = activeAccessToken("refreshed-access");
  let protectedCalls = 0;
  let refreshCalls = 0;
  const harness = createHarness({
    accessToken: originalToken,
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) {
        refreshCalls += 1;
        return Response.json({ accessToken: refreshedToken });
      }
      protectedCalls += 1;
      return request.headers.get("authorization") === `Bearer ${refreshedToken}`
        ? new Response(null, { status: 200 })
        : new Response(null, { status: 401 });
    },
  });

  const response = await harness.authFetch(
    new Request(`${ORIGIN}${API_BASE_URL}/projects`, {
      headers: { authorization: `Bearer ${originalToken}` },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(refreshCalls, 1);
  assert.equal(protectedCalls, 2);
});

test("reuses a token refreshed by an earlier overlapping 401 response", async () => {
  const originalToken = activeAccessToken("overlap-original");
  const refreshedToken = activeAccessToken("overlap-refreshed");
  let protectedCalls = 0;
  let refreshCalls = 0;
  let releaseSecondUnauthorized;
  const secondUnauthorizedCanReturn = new Promise((resolve) => {
    releaseSecondUnauthorized = resolve;
  });
  const harness = createHarness({
    accessToken: originalToken,
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) {
        refreshCalls += 1;
        releaseSecondUnauthorized();
        return Response.json({ accessToken: refreshedToken });
      }
      protectedCalls += 1;
      if (request.headers.get("authorization") === `Bearer ${refreshedToken}`) {
        return new Response(null, { status: 200 });
      }
      if (protectedCalls === 2) await secondUnauthorizedCanReturn;
      return new Response(null, { status: 401 });
    },
  });

  const makeRequest = () =>
    harness.authFetch(
      new Request(`${ORIGIN}${API_BASE_URL}/projects`, {
        headers: { authorization: `Bearer ${originalToken}` },
      }),
    );
  const responses = await Promise.all([makeRequest(), makeRequest()]);
  assert.deepEqual(responses.map((response) => response.status), [200, 200]);
  assert.equal(refreshCalls, 1);
  assert.equal(protectedCalls, 4);
});

test("invalidates the session only when refresh is unauthorized", async () => {
  let protectedCalls = 0;
  const harness = createHarness({
    accessToken: expiredAccessToken(),
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) {
        return new Response(null, { status: 401 });
      }
      protectedCalls += 1;
      return new Response(null, { status: 401 });
    },
  });

  const response = await harness.authFetch(
    new Request(`${ORIGIN}${API_BASE_URL}/projects`, {
      headers: { authorization: "Bearer expired" },
    }),
  );
  assert.equal(response.status, 401);
  assert.equal(protectedCalls, 1);
  assert.equal(harness.getInvalidations(), 1);
  assert.equal(harness.storage.size, 0);
});

test("preserves the session when refresh has a temporary server failure", async () => {
  const harness = createHarness({
    accessToken: expiredAccessToken(),
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      assert.ok(new URL(request.url).pathname.endsWith("/refresh"));
      return new Response(null, { status: 503 });
    },
  });

  await assert.rejects(
    harness.authFetch(
      new Request(`${ORIGIN}${API_BASE_URL}/projects`, {
        headers: { authorization: "Bearer expired" },
      }),
    ),
    /Session refresh failed \(503\)/,
  );
  assert.equal(harness.getInvalidations(), 0);
  assert.equal(harness.storage.size, 2);
});

test("does not refresh or invalidate public authentication failures", async () => {
  let refreshCalls = 0;
  const harness = createHarness({
    accessToken: expiredAccessToken(),
    refreshToken: activeRefreshToken(),
    transport: async (input, init) => {
      const request = asRequest(input, init);
      if (new URL(request.url).pathname.endsWith("/refresh")) refreshCalls += 1;
      return new Response(null, { status: 401 });
    },
  });

  const response = await harness.authFetch(
    new Request(`${ORIGIN}${API_BASE_URL}/login`, { method: "POST" }),
  );
  assert.equal(response.status, 401);
  assert.equal(refreshCalls, 0);
  assert.equal(harness.getInvalidations(), 0);
});
