import assert from "node:assert/strict";
import test from "node:test";
import {
  getWorkspaceDocumentTitle,
  getWorkspaceRouteLabel,
} from "../src/components/layout/workspaceRoutePresentation.js";
import {
  getPlatformRoleLabel,
  PRODUCT_SHORT_NAME,
} from "../src/shared/productPresentation.js";

test("presents readable names for global workspace routes", () => {
  assert.equal(getWorkspaceRouteLabel("/home"), "總覽");
  assert.equal(getWorkspaceRouteLabel("/dashboard"), "營運儀表板");
  assert.equal(getWorkspaceRouteLabel("/notifications"), "通知");
});

test("distinguishes project workspace routes", () => {
  assert.equal(getWorkspaceRouteLabel("/projects"), "專案");
  assert.equal(getWorkspaceRouteLabel("/projects/project-a"), "專案工作區");
  assert.equal(getWorkspaceRouteLabel("/projects/project-a/issues"), "Issue 清單");
  assert.equal(getWorkspaceRouteLabel("/projects/project-a/board"), "專案看板");
  assert.equal(getWorkspaceRouteLabel("/projects/project-a/sprint"), "Sprint 管理");
  assert.equal(getWorkspaceRouteLabel("/projects/project-a/milestone"), "里程碑管理");
  assert.equal(getWorkspaceRouteLabel("/projects/project-a/sprint/"), "Sprint 管理");
});

test("uses a stable product suffix and labels unknown routes", () => {
  assert.equal(getWorkspaceDocumentTitle("/settings"), `設定 · ${PRODUCT_SHORT_NAME}`);
  assert.equal(getWorkspaceDocumentTitle("/missing"), `找不到頁面 · ${PRODUCT_SHORT_NAME}`);
});

test("presents platform roles as product language", () => {
  assert.equal(getPlatformRoleLabel("project_admin"), "專案管理員");
  assert.equal(getPlatformRoleLabel("owner"), "平台擁有者");
  assert.equal(getPlatformRoleLabel("future_role"), "自訂角色");
});
