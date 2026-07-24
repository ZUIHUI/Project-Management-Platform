type IssueUpdateSource = {
  title: string;
  description: string;
  priority: string;
  dueDate: Date | null;
  sprintId: string | null;
  milestoneId: string | null;
  assigneeId: string | null;
};

type IssueUpdateData = IssueUpdateSource;

type IssueUpdatePlan =
  | { error: string; status: number }
  | { data: IssueUpdateData; changed: boolean };

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const sameNullableDate = (left: Date | null, right: Date | null) => {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return left.getTime() === right.getTime();
};

export const prepareIssueUpdate = (
  issue: IssueUpdateSource,
  payload: Record<string, unknown>,
): IssueUpdatePlan => {
  const nextTitle = hasOwn(payload, "title") ? `${payload.title ?? ""}`.trim() : issue.title;
  if (!nextTitle) return { error: "title is required", status: 422 };

  const dueDateInput = hasOwn(payload, "dueAt")
    ? payload.dueAt
    : hasOwn(payload, "dueDate")
      ? payload.dueDate
      : issue.dueDate;
  const nextDueDate = dueDateInput ? new Date(`${dueDateInput}`) : null;
  if (nextDueDate && Number.isNaN(nextDueDate.getTime())) {
    return { error: "dueAt must be a valid date", status: 422 };
  }

  const data: IssueUpdateData = {
    title: nextTitle,
    description: hasOwn(payload, "description")
      ? `${payload.description ?? ""}`.trim()
      : issue.description,
    priority: hasOwn(payload, "priority") && payload.priority
      ? `${payload.priority}`
      : issue.priority,
    dueDate: nextDueDate,
    sprintId: hasOwn(payload, "sprintId") ? `${payload.sprintId || ""}` || null : issue.sprintId,
    milestoneId: hasOwn(payload, "milestoneId") ? `${payload.milestoneId || ""}` || null : issue.milestoneId,
    assigneeId: hasOwn(payload, "assigneeId") ? `${payload.assigneeId || ""}` || null : issue.assigneeId,
  };
  const changed = (
    data.title !== issue.title
    || data.description !== issue.description
    || data.priority !== issue.priority
    || !sameNullableDate(data.dueDate, issue.dueDate)
    || data.sprintId !== issue.sprintId
    || data.milestoneId !== issue.milestoneId
    || data.assigneeId !== issue.assigneeId
  );

  return { data, changed };
};
