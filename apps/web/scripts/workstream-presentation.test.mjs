import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNotificationIssueHref,
  getNotificationTypeLabel,
  presentNotification,
} from "../src/features/notification/notificationPresentation.ts";
import {
  SYSTEM_ACTOR_ID,
  buildActivityActorOptions,
  getActivityActionLabel,
  presentActivity,
  presentActivityContext,
} from "../src/features/activity/activityPresentation.ts";
import { buildProjectMemberLabelMap, presentProjectMember } from "../src/features/project/projectMemberPresentation.ts";

test("notification presentation creates a project-scoped Issue deep link", () => {
  const notification = {
    id: "notification-1",
    userId: "user-pm",
    type: "issue.assigned",
    message: JSON.stringify({ issueId: "issue/2" }),
    payload: {
      issueId: "issue/2",
      issueNumber: 12,
      issueTitle: "Review accessibility",
      projectId: "project 1",
      projectKey: "CORE",
      projectName: "Core Refactor",
    },
    read: false,
    createdAt: "2026-07-22T00:00:00.000Z",
  };

  const presentation = presentNotification(notification);
  assert.equal(presentation.title, "Issue #12「Review accessibility」已指派給你");
  assert.equal(presentation.detail, "CORE · Core Refactor");
  assert.equal(presentation.issueHref, "/projects/project%201/issues?issue=issue%2F2");
});

test("notification deep links require both project and Issue context", () => {
  assert.equal(buildNotificationIssueHref("project-1", "issue-1"), "/projects/project-1/issues?issue=issue-1");
  assert.equal(buildNotificationIssueHref("", "issue-1"), "");
  assert.equal(buildNotificationIssueHref("project-1", ""), "");
});

test("workflow notifications explain the transition and keep Issue context", () => {
  const presentation = presentNotification({
    id: "notification-status",
    userId: "user-dev",
    type: "workflow_status_changed",
    message: JSON.stringify({
      issueId: "issue-2",
      fromStatusId: "todo",
      toStatusId: "doing",
    }),
    payload: {
      issueId: "issue-2",
      issueNumber: 12,
      issueTitle: "Review accessibility",
      projectId: "project-1",
      projectKey: "CORE",
      projectName: "Core Refactor",
      fromStatusId: "todo",
      toStatusId: "doing",
    },
    read: false,
    createdAt: "2026-07-22T00:00:00.000Z",
  });

  assert.deepEqual(presentation, {
    label: "流程",
    title: "Issue #12「Review accessibility」已由 待處理 轉為 進行中",
    detail: "CORE · Core Refactor",
    issueId: "issue-2",
    issueHref: "/projects/project-1/issues?issue=issue-2",
  });
});

test("legacy workflow notifications preserve their plain text", () => {
  const presentation = presentNotification({
    id: "notification-status-legacy",
    userId: "user-dev",
    type: "workflow_status_changed",
    message: "Issue #12 已由 待處理 轉為 進行中",
    read: false,
    createdAt: "2026-07-22T00:00:00.000Z",
  });

  assert.equal(presentation.title, "Issue #12 已由 待處理 轉為 進行中");
  assert.equal(presentation.issueHref, "");
});

test("unknown event types use safe product labels", () => {
  assert.equal(getNotificationTypeLabel("internal_event_v2"), "通知");
  assert.equal(getActivityActionLabel("issue.internal_repair"), "Issue 更新");
});

test("activity presentation replaces opaque IDs with readable context", () => {
  const activity = {
    id: "activity-1",
    actorId: "user-pm",
    actorName: "PM",
    actorEmail: "pm@example.com",
    issueId: "issue/2",
    issueNumber: 12,
    issueTitle: "Review accessibility",
    projectId: "project 1",
    projectKey: "CORE",
    projectName: "Core Refactor",
    action: "issue.updated",
    before: null,
    after: null,
    createdAt: "2026-07-22T00:00:00.000Z",
  };

  assert.deepEqual(presentActivityContext(activity), {
    actorLabel: "PM",
    actorDetail: "pm@example.com",
    issueLabel: "CORE · #12",
    issueTitle: "Review accessibility",
    projectLabel: "Core Refactor",
    issueHref: "/projects/project%201/issues?issue=issue%2F2",
  });
});

test("activity actor options deduplicate people and localize the system fallback", () => {
  const activities = [
    { actorId: "user-pm", actorName: "PM", actorEmail: "pm@example.com" },
    { actorId: "user-pm", actorName: "PM", actorEmail: "pm@example.com" },
    { actorId: null, actorName: "System", actorEmail: null },
  ];

  assert.deepEqual(buildActivityActorOptions(activities), [
    { id: "user-pm", label: "PM", detail: "pm@example.com" },
    { id: SYSTEM_ACTOR_ID, label: "系統", detail: "" },
  ]);
});

test("activity changes resolve assignee references without exposing internal user IDs", () => {
  const activity = {
    id: "activity-assigned",
    issueId: "issue-1",
    action: "issue.assigned",
    before: JSON.stringify({ assigneeId: null }),
    after: JSON.stringify({ assigneeId: "user-dev" }),
    userReferences: [
      { id: "user-dev", name: "Developer" },
    ],
    createdAt: "2026-07-22T00:00:00.000Z",
  };

  assert.deepEqual(presentActivity(activity), {
    summary: "更新了 負責人",
    changes: [{
      field: "assigneeId",
      label: "負責人",
      before: "未指派",
      after: "Developer",
    }],
  });
});

test("activity changes use a safe label when an assignee no longer exists", () => {
  const activity = {
    id: "activity-assigned-removed",
    issueId: "issue-1",
    action: "issue.assigned",
    before: JSON.stringify({ assigneeId: "user-removed" }),
    after: JSON.stringify({ assigneeId: null }),
    userReferences: [],
    createdAt: "2026-07-22T00:00:00.000Z",
  };

  assert.equal(presentActivity(activity).changes[0].before, "已移除的成員");
});

test("project member presentation prefers readable identity while retaining the technical ID", () => {
  assert.deepEqual(presentProjectMember({
    projectId: "project-1",
    userId: "user-dev",
    role: "member",
    name: "Developer",
    email: "dev@example.com",
  }), {
    userId: "user-dev",
    displayName: "Developer",
    email: "dev@example.com",
    initial: "D",
    hasReadableName: true,
  });
});

test("project member label maps keep board projections readable", () => {
  const labels = buildProjectMemberLabelMap([
    { userId: "user-pm", name: "PM", email: "pm@example.com" },
  ]);

  assert.equal(labels.get("user-pm"), "PM");
});
