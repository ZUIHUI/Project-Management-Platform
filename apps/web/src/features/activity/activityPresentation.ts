import type { components } from "../../shared/api/schema";
import { getIssuePriorityPresentation, getWorkflowStatusLabel } from "../issue/workflowPresentation.js";

type ActivityLog = components["schemas"]["ActivityLog"];
type JsonRecord = Record<string, unknown>;

export type ActivityActorOption = {
  id: string;
  label: string;
  detail: string;
};

export const SYSTEM_ACTOR_ID = "__system__";

const presentActorLabel = (name?: string | null, id?: string | null) => (
  name === "System" ? "系統" : name || id || "系統"
);

export const activityActionLabels: Record<string, string> = {
  "issue.created": "建立 Issue",
  "issue.updated": "更新 Issue",
  "issue.status_changed": "變更狀態",
  "issue.assigned": "調整負責人",
  "issue.commented": "新增留言",
};

export const activityActionTones: Record<string, string> = {
  "issue.created": "success",
  "issue.status_changed": "brand",
  "issue.assigned": "warning",
};

export const getActivityActionLabel = (action: string) => activityActionLabels[action] ?? "Issue 更新";

const fieldLabels: Record<string, string> = {
  title: "標題",
  description: "描述",
  statusId: "狀態",
  priority: "優先順序",
  assigneeId: "負責人",
  dueDate: "截止日期",
  dueAt: "截止日期",
  sprintId: "Sprint",
  milestoneId: "里程碑",
};

const parseRecord = (value?: string | null): JsonRecord | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as JsonRecord : null;
  } catch {
    return null;
  }
};

const presentValue = (field: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return field === "assigneeId" ? "未指派" : "未設定";
  if (field === "statusId") return getWorkflowStatusLabel(`${value}`);
  if (field === "priority") return getIssuePriorityPresentation(`${value}`).label;
  if (field === "dueDate" || field === "dueAt") {
    const date = new Date(`${value}`);
    return Number.isNaN(date.getTime()) ? `${value}` : new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(date);
  }
  if (typeof value === "object") return "內容已更新";
  const text = `${value}`.trim();
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
};

export const formatActivityTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "時間未知";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export const activityActorId = (activity: ActivityLog) => activity.actorId ?? SYSTEM_ACTOR_ID;

export const buildActivityActorOptions = (activities: ActivityLog[]): ActivityActorOption[] => {
  const actors = new Map<string, ActivityActorOption>();
  activities.forEach((activity) => {
    const id = activityActorId(activity);
    if (actors.has(id)) return;
    actors.set(id, {
      id,
      label: presentActorLabel(activity.actorName, activity.actorId),
      detail: activity.actorEmail ?? "",
    });
  });
  return [...actors.values()].sort((left, right) => {
    if (left.id === SYSTEM_ACTOR_ID) return 1;
    if (right.id === SYSTEM_ACTOR_ID) return -1;
    return left.label.localeCompare(right.label, "zh-TW");
  });
};

export const buildActivityIssueHref = (activity: ActivityLog) => (
  activity.projectId
    ? `/projects/${encodeURIComponent(activity.projectId)}/issues?issue=${encodeURIComponent(activity.issueId)}`
    : ""
);

export const presentActivityContext = (activity: ActivityLog) => ({
  actorLabel: presentActorLabel(activity.actorName, activity.actorId),
  actorDetail: activity.actorEmail ?? "",
  issueLabel: activity.issueNumber
    ? `${activity.projectKey ? `${activity.projectKey} · ` : ""}#${activity.issueNumber}`
    : "Issue",
  issueTitle: activity.issueTitle || activity.issueId,
  projectLabel: activity.projectName || activity.projectKey || activity.projectId || "",
  issueHref: buildActivityIssueHref(activity),
});

export const presentActivity = (activity: ActivityLog) => {
  const before = parseRecord(activity.before);
  const after = parseRecord(activity.after);

  if (activity.action === "issue.created") {
    const title = after?.title ? `「${presentValue("title", after.title)}」` : "一個新 Issue";
    return { summary: `建立了 ${title}`, changes: [] };
  }

  if (activity.action === "issue.commented") {
    return { summary: after?.body ? `留言：${presentValue("body", after.body)}` : "新增了一則留言", changes: [] };
  }

  const changes = Object.keys(fieldLabels)
    .filter((field) => before?.[field] !== after?.[field])
    .map((field) => ({
      field,
      label: fieldLabels[field],
      before: presentValue(field, before?.[field]),
      after: presentValue(field, after?.[field]),
    }))
    .slice(0, 4);

  return {
    summary: changes.length ? `更新了 ${changes.map((change) => change.label).join("、")}` : "更新了 Issue 內容",
    changes,
  };
};
