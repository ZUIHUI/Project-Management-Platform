import type { ProjectTaskView } from "../issue/useProjectViewData";

export type WorkloadTeamMember = {
  id: string;
  name?: string;
  email?: string;
};

export type MemberIssueDistribution = {
  id: string;
  name: string;
  email: string;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
};

export type WorkloadMetrics = {
  members: MemberIssueDistribution[];
  activeMembers: MemberIssueDistribution[];
  aboveAverageMembers: MemberIssueDistribution[];
  maxIssueCount: number;
  averageIssueCount: number;
  unassignedCount: number;
  inProgressCount: number;
  completedCount: number;
  hasConcurrentWorkSignal: boolean;
};

export const deriveWorkloadMetrics = (
  tasks: ProjectTaskView[],
  team: WorkloadTeamMember[],
): WorkloadMetrics => {
  const byMember = new Map<string, MemberIssueDistribution>(
    team.map((member) => [member.id, {
      id: member.id,
      name: member.name || member.id,
      email: member.email || "",
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
    }]),
  );

  tasks.forEach((task) => {
    if (!task.assignee) return;
    if (!byMember.has(task.assignee)) {
      byMember.set(task.assignee, {
        id: task.assignee,
        name: task.assignee,
        email: "",
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
      });
    }
    const member = byMember.get(task.assignee)!;
    member.total += 1;
    if (task.statusId === "done") member.completed += 1;
    else if (task.statusId === "doing") member.inProgress += 1;
    else member.todo += 1;
  });

  const members = [...byMember.values()]
    .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name));
  const activeMembers = members.filter((member) => member.total > 0);
  const averageIssueCount = members.length
    ? Math.round(members.reduce((sum, member) => sum + member.total, 0) / members.length)
    : 0;
  const aboveAverageMembers = members.filter(
    (member) => averageIssueCount > 0 && member.total > averageIssueCount * 1.5,
  );

  return {
    members,
    activeMembers,
    aboveAverageMembers,
    maxIssueCount: Math.max(...members.map((member) => member.total), 0),
    averageIssueCount,
    unassignedCount: tasks.filter((task) => !task.assignee).length,
    inProgressCount: tasks.filter((task) => task.statusId === "doing").length,
    completedCount: tasks.filter((task) => task.statusId === "done").length,
    hasConcurrentWorkSignal: activeMembers.some((member) => member.inProgress > 3),
  };
};
