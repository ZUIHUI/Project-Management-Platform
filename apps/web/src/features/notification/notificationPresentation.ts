import type { components } from "../../shared/api/schema";
import { getWorkflowStatusLabel } from "../issue/workflowPresentation.js";

type Notification = components["schemas"]["Notification"];
type JsonRecord = Record<string, unknown>;

const typeLabels: Record<string, string> = {
  assigned: "工作指派",
  mention: "提及",
  "issue.assigned": "指派",
  "comment.mentioned": "提及",
  workflow_status_changed: "流程",
  project_status_changed: "專案",
  manual: "提醒",
  system: "系統",
};

export const getNotificationTypeLabel = (type: string) => typeLabels[type] ?? "通知";

const parseRecord = (value: unknown): JsonRecord | null => {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as JsonRecord;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as JsonRecord : null;
  } catch {
    return null;
  }
};

const textValue = (value: unknown) => typeof value === "string" ? value.trim() : "";

export const buildNotificationIssueHref = (projectId: string, issueId: string) => (
  projectId && issueId
    ? `/projects/${encodeURIComponent(projectId)}/issues?issue=${encodeURIComponent(issueId)}`
    : ""
);

export const formatNotificationTime = (value?: string) => {
  if (!value) return "時間未知";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "時間未知";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export const presentNotification = (notification: Notification) => {
  const payload = parseRecord(notification.payload) ?? parseRecord(notification.message);
  const issueId = typeof payload?.issueId === "string" ? payload.issueId : "";
  const issueNumber = typeof payload?.issueNumber === "number" || typeof payload?.issueNumber === "string"
    ? `${payload.issueNumber}`
    : "";
  const issueTitle = textValue(payload?.issueTitle);
  const projectId = textValue(payload?.projectId);
  const projectKey = textValue(payload?.projectKey);
  const projectName = textValue(payload?.projectName);
  const projectLabel = [projectKey, projectName].filter(Boolean).join(" · ");
  const issueHref = buildNotificationIssueHref(projectId, issueId);
  const plainMessage = parseRecord(notification.message) ? "" : notification.message;

  if (notification.type === "issue.assigned") {
    return {
      label: getNotificationTypeLabel(notification.type),
      title: issueNumber
        ? `Issue #${issueNumber}${issueTitle ? `「${issueTitle}」` : ""}已指派給你`
        : "有一個 Issue 已指派給你",
      detail: projectLabel || "前往專案工作區查看最新指派。",
      issueId,
      issueHref,
    };
  }

  if (notification.type === "comment.mentioned") {
    return {
      label: getNotificationTypeLabel(notification.type),
      title: issueNumber
        ? `你在 Issue #${issueNumber}${issueTitle ? `「${issueTitle}」` : ""}的留言中被提及`
        : "你在 Issue 留言中被提及",
      detail: projectLabel || "前往 Issue 查看留言內容。",
      issueId,
      issueHref,
    };
  }

  const fromStatusId = textValue(payload?.fromStatusId);
  const fromStatusName = textValue(payload?.fromStatusName);
  const toStatusId = textValue(payload?.toStatusId);
  const toStatusName = textValue(payload?.toStatusName);
  const hasWorkflowTransition = Boolean(
    (fromStatusId || fromStatusName) && (toStatusId || toStatusName),
  );
  if (notification.type === "workflow_status_changed" && hasWorkflowTransition) {
    const fromStatus = getWorkflowStatusLabel(fromStatusId, fromStatusName);
    const toStatus = getWorkflowStatusLabel(toStatusId, toStatusName);
    return {
      label: getNotificationTypeLabel(notification.type),
      title: issueNumber
        ? `Issue #${issueNumber}${issueTitle ? `「${issueTitle}」` : ""}已由 ${fromStatus} 轉為 ${toStatus}`
        : `Issue 狀態已由 ${fromStatus} 轉為 ${toStatus}`,
      detail: projectLabel || "前往 Issue 查看最新工作狀態。",
      issueId,
      issueHref,
    };
  }

  return {
    label: getNotificationTypeLabel(notification.type),
    title: plainMessage || "收到一則系統通知",
    detail: projectLabel || "",
    issueId,
    issueHref,
  };
};
