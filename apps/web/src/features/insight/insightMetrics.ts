import type { ProjectTaskView, ProjectTeamMemberView } from "../issue/useProjectViewData";

export type ProjectInsightStatistics = {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  withDueDate: number;
  withoutDueDate: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  completionRate: number;
  dueDateCoverage: number;
};

export type AssigneeCompletion = {
  id: string;
  name: string;
  email: string;
  total: number;
  completed: number;
  completionRate: number;
};

export const deriveProjectInsightStatistics = (
  tasks: ProjectTaskView[],
  now = Date.now(),
): ProjectInsightStatistics => {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.statusId === "done").length;
  const inProgress = tasks.filter((task) => task.statusId === "doing").length;
  const todo = tasks.filter((task) => task.statusId === "todo").length;
  const withDueDate = tasks.filter((task) => Boolean(task.dueDate)).length;
  const overdue = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate).getTime() < now && task.statusId !== "done",
  ).length;
  const highPriority = tasks.filter((task) => task.priority === "high").length;
  const mediumPriority = tasks.filter((task) => task.priority === "medium").length;
  const lowPriority = tasks.filter((task) => task.priority === "low").length;

  return {
    total,
    completed,
    inProgress,
    todo,
    overdue,
    withDueDate,
    withoutDueDate: total - withDueDate,
    highPriority,
    mediumPriority,
    lowPriority,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    dueDateCoverage: total ? Math.round((withDueDate / total) * 100) : 0,
  };
};

export const deriveAssigneeCompletion = (
  tasks: ProjectTaskView[],
  team: ProjectTeamMemberView[],
): AssigneeCompletion[] => {
  const teamById = new Map(team.map((member) => [member.id, member]));
  const byAssignee = new Map<string, Omit<AssigneeCompletion, "completionRate">>();
  tasks.forEach((task) => {
    if (!task.assignee) return;
    const identity = teamById.get(task.assignee);
    const current = byAssignee.get(task.assignee) ?? {
      id: task.assignee,
      name: identity?.name || task.assignee,
      email: identity?.email || "",
      total: 0,
      completed: 0,
    };
    current.total += 1;
    if (task.statusId === "done") current.completed += 1;
    byAssignee.set(task.assignee, current);
  });

  return [...byAssignee.values()]
    .map((member) => ({
      ...member,
      completionRate: member.total ? Math.round((member.completed / member.total) * 100) : 0,
    }))
    .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name));
};
