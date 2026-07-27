const STANDARD_STATUS_PRESENTATION = Object.freeze({
  todo: Object.freeze({ label: "待處理", tone: "neutral" }),
  doing: Object.freeze({ label: "進行中", tone: "brand" }),
  done: Object.freeze({ label: "已完成", tone: "success" }),
});

const CORE_WORKFLOW_STATUS_ORDER = Object.freeze(["todo", "doing", "done"]);

const CORE_WORKFLOW_TRANSITIONS = Object.freeze({
  todo: Object.freeze(["doing"]),
  doing: Object.freeze(["todo", "done"]),
  done: Object.freeze(["doing"]),
});

const STATUS_ALIASES = Object.freeze({
  todo: "todo",
  "to do": "todo",
  待處理: "todo",
  doing: "doing",
  "in progress": "doing",
  進行中: "doing",
  done: "done",
  complete: "done",
  completed: "done",
  已完成: "done",
});

const PRIORITY_PRESENTATION = Object.freeze({
  high: Object.freeze({ label: "高優先", shortLabel: "高", tone: "danger" }),
  medium: Object.freeze({ label: "中優先", shortLabel: "中", tone: "warning" }),
  low: Object.freeze({ label: "低優先", shortLabel: "低", tone: "neutral" }),
});

const asStatusParts = (status, fallbackName) => {
  if (status && typeof status === "object") {
    return { id: `${status.id ?? ""}`.trim(), name: `${status.name ?? fallbackName ?? ""}`.trim() };
  }
  return { id: `${status ?? ""}`.trim(), name: `${fallbackName ?? ""}`.trim() };
};

export const getCanonicalWorkflowStatusId = (status) => {
  const value = `${status ?? ""}`.trim().toLocaleLowerCase("en-US").replace(/[-_]+/g, " ");
  return STATUS_ALIASES[value] ?? null;
};

export const isCoreWorkflowReady = (statuses = []) => (
  CORE_WORKFLOW_STATUS_ORDER.every((id, index) => (
    statuses.some((status) => (
      status?.id === id
      && status?.order === index + 1
      && Array.isArray(status.allowedToIds)
    ))
  ))
);

export const getWorkflowStatusLabel = (status, fallbackName) => {
  const { id, name } = asStatusParts(status, fallbackName);
  const canonicalId = getCanonicalWorkflowStatusId(id) ?? getCanonicalWorkflowStatusId(name);
  return STANDARD_STATUS_PRESENTATION[canonicalId]?.label ?? (name || id || "未知狀態");
};

export const getWorkflowStatusTone = (status, statuses = []) => {
  const { id, name } = asStatusParts(status);
  const canonicalId = getCanonicalWorkflowStatusId(id) ?? getCanonicalWorkflowStatusId(name);
  if (canonicalId) return STANDARD_STATUS_PRESENTATION[canonicalId].tone;

  const index = statuses.findIndex((item) => item.id === id);
  if (index === statuses.length - 1 && index >= 0) return "success";
  if (index > 0) return "brand";
  return "neutral";
};

export const getIssuePriorityPresentation = (priority) => (
  PRIORITY_PRESENTATION[priority] ?? {
    label: "未設定優先級",
    shortLabel: "未設定",
    tone: "neutral",
  }
);

export const ISSUE_PRIORITY_OPTIONS = Object.freeze(
  ["low", "medium", "high"].map((id) => Object.freeze({ id, label: PRIORITY_PRESENTATION[id].label })),
);

export const buildWorkflowStatusOptions = (statuses = []) => statuses.map((status) => {
  const canonicalId = getCanonicalWorkflowStatusId(status.id) ?? getCanonicalWorkflowStatusId(status.name);
  return {
    id: status.id,
    label: getWorkflowStatusLabel(status),
    allowedToIds: Array.isArray(status.allowedToIds)
      ? [...new Set(status.allowedToIds)]
      : [...(CORE_WORKFLOW_TRANSITIONS[canonicalId] ?? [])],
  };
});

export const getWorkflowTransitionTargets = (statuses = [], currentStatusId) => {
  const currentStatus = statuses.find((status) => status.id === currentStatusId);
  if (!currentStatus || !Array.isArray(currentStatus.allowedToIds)) return [];
  const allowedToIds = new Set(currentStatus.allowedToIds);
  return statuses.filter((status) => status.id !== currentStatusId && allowedToIds.has(status.id));
};

export const DEFAULT_WORKFLOW_STATUS_OPTIONS = Object.freeze(
  Object.entries(STANDARD_STATUS_PRESENTATION).map(([id, presentation]) => Object.freeze({
    id,
    label: presentation.label,
    allowedToIds: CORE_WORKFLOW_TRANSITIONS[id],
  })),
);
