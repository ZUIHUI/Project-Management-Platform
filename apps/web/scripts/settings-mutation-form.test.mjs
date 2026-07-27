import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PasswordSettingsCard from "../src/features/auth/components/PasswordSettingsCard.jsx";
import ProfileSettingsCard from "../src/features/auth/components/ProfileSettingsCard.jsx";

const profile = {
  id: "user-settings-test",
  name: "設定測試者",
  email: "settings@example.test",
  role: "owner",
};

test("account-level busy state locks profile controls without claiming a profile save", () => {
  const html = renderToStaticMarkup(React.createElement(ProfileSettingsCard, {
    profile,
    saving: false,
    busy: true,
    error: "",
    errorField: null,
    notice: "",
    onSave: async () => ({ ok: true }),
  }));

  assert.match(html, /<form[^>]*aria-busy="true"/);
  assert.match(html, /<fieldset disabled=""/);
  assert.match(html, />儲存個人資料</);
  assert.doesNotMatch(html, />儲存中…</);
});

test("password mutation keeps its progress label while locking the whole form", () => {
  const html = renderToStaticMarkup(React.createElement(PasswordSettingsCard, {
    saving: true,
    busy: true,
    error: "",
    errorField: null,
    onChangePassword: async () => ({ ok: true }),
  }));

  assert.match(html, /<form[^>]*aria-busy="true"/);
  assert.match(html, /<fieldset disabled=""/);
  assert.match(html, />更新中…</);
});
