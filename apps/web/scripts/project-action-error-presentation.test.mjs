import assert from "node:assert/strict";
import test from "node:test";
import {
  presentProjectCreateError,
  presentTeamMemberError,
} from "../src/features/project/projectActionErrorPresentation.js";
import {
  getSprintEndDateError,
  SPRINT_END_DATE_ERROR,
} from "../src/features/project/projectPlanningValidation.js";

const apiError = (message) => ({ response: { data: { error: { message } } } });

test("maps project key conflicts and validation to the key field", () => {
  assert.deepEqual(presentProjectCreateError(apiError("Project key already exists"), "fallback"), {
    message: "此專案代碼已存在，請改用其他代碼。",
    field: "key",
  });
  assert.equal(
    presentProjectCreateError(apiError("project key must be valid"), "fallback").field,
    "key",
  );
});

test("maps a missing team member to the account selection field", () => {
  assert.deepEqual(presentTeamMemberError(apiError("User not found"), "fallback"), {
    message: "找不到這個帳號，請重新搜尋後再試。",
    field: "userId",
  });
  assert.deepEqual(presentTeamMemberError(new Error("offline"), "fallback"), {
    message: "fallback",
    field: "",
  });
});

test("requires a Sprint end date to be later than its start date", () => {
  assert.equal(getSprintEndDateError("2026-07-23", "2026-07-23"), SPRINT_END_DATE_ERROR);
  assert.equal(getSprintEndDateError("2026-07-24", "2026-07-23"), SPRINT_END_DATE_ERROR);
  assert.equal(getSprintEndDateError("2026-07-23", "2026-07-24"), "");
  assert.equal(getSprintEndDateError("2026-07-23", ""), "");
});
