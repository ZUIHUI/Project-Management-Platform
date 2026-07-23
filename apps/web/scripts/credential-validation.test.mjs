import test from "node:test";
import assert from "node:assert/strict";
import {
  PASSWORD_POLICY_TEXT,
  validateLoginInput,
  validateLoginFields,
  validateNewPassword,
  validatePasswordChangeInput,
  validateProfileInput,
  validateRegisterInput,
  validateRegisterFields,
} from "../src/features/auth/credentialValidation.js";

test("validates login email and required credentials", () => {
  assert.equal(validateLoginInput("", ""), "請輸入 Email 與密碼");
  assert.equal(validateLoginInput("not-an-email", "Password9"), "Email 格式不正確");
  assert.equal(validateLoginInput(" person@example.com ", "Password9"), "");
});

test("returns field-scoped login errors", () => {
  assert.deepEqual(validateLoginFields("bad", ""), {
    email: "Email 格式不正確。",
    password: "請輸入密碼。",
  });
  assert.deepEqual(validateLoginFields("person@example.com", "Password9"), {});
});

test("keeps registration aligned with name and password policies", () => {
  assert.equal(validateRegisterInput("A", "person@example.com", "Password9"), "姓名長度需介於 2 到 50 字元");
  assert.equal(validateNewPassword("weak"), PASSWORD_POLICY_TEXT);
  assert.equal(validateRegisterInput("Person", "person@example.com", "Password9"), "");
});

test("returns every actionable registration field error", () => {
  assert.deepEqual(validateRegisterFields("A", "bad", "weak", "different"), {
    name: "姓名長度需介於 2 到 50 個字元。",
    email: "Email 格式不正確。",
    password: `${PASSWORD_POLICY_TEXT}。`,
    confirmPassword: "密碼與確認密碼不一致。",
  });
  assert.deepEqual(
    validateRegisterFields("Person", "person@example.com", "Password9", "Password9"),
    {},
  );
});

test("returns field-scoped profile validation errors", () => {
  assert.deepEqual(validateProfileInput("A", "bad"), {
    name: "姓名長度需介於 2 到 50 個字元。",
    email: "Email 格式不正確。",
  });
  assert.deepEqual(validateProfileInput(" Person ", " PERSON@example.com "), {});
});

test("returns field-scoped password validation errors", () => {
  assert.deepEqual(validatePasswordChangeInput("", "weak", "different"), {
    currentPassword: "請輸入目前密碼。",
    newPassword: PASSWORD_POLICY_TEXT,
    confirmPassword: "新密碼與確認密碼不一致。",
  });
  assert.deepEqual(validatePasswordChangeInput("Current9", "NewPassword9", "NewPassword9"), {});
});
