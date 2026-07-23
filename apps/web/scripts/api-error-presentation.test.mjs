import assert from "node:assert/strict";
import test from "node:test";
import {
  getApiErrorDetails,
  getApiErrorMessage,
} from "../src/shared/api/apiErrorPresentation.js";

const apiError = (status, message) => ({ response: { status, data: { error: { message } } } });

test("turns transport failures into recoverable platform language", () => {
  assert.equal(
    getApiErrorMessage(new TypeError("Failed to fetch"), "fallback"),
    "目前無法連線至平台服務，請稍後重新整理。",
  );
  assert.equal(
    getApiErrorMessage(apiError(503, "Database unavailable"), "fallback"),
    "目前無法連線至平台服務，請稍後重新整理。",
  );
});

test("never exposes raw session or permission errors", () => {
  assert.equal(
    getApiErrorMessage(apiError(401, "Invalid or expired token"), "fallback"),
    "登入狀態已失效，請重新登入後繼續。",
  );
  assert.equal(
    getApiErrorMessage(apiError(403, "Forbidden"), "fallback"),
    "你沒有執行這項操作的權限。",
  );
});

test("localizes known domain errors and suppresses unknown internal text", () => {
  assert.equal(
    getApiErrorMessage(apiError(422, "assignee is not in project scope"), "fallback"),
    "選取的負責人不在目前專案中。",
  );
  assert.equal(getApiErrorMessage(apiError(422, "Internal validator X12"), "安全的備援訊息"), "安全的備援訊息");
  assert.deepEqual(getApiErrorDetails(apiError(404, "Project not found")), {
    status: 404,
    message: "Project not found",
  });
});
