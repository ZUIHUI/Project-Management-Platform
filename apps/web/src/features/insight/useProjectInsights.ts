import { useMemo } from "react";
import type { ProjectTaskView, ProjectTeamMemberView } from "../issue/useProjectViewData";
import { deriveAssigneeCompletion, deriveProjectInsightStatistics } from "./insightMetrics";

export const useProjectInsights = (tasks: ProjectTaskView[], team: ProjectTeamMemberView[]) => {
  const statistics = useMemo(() => deriveProjectInsightStatistics(tasks), [tasks]);
  const assigneeCompletion = useMemo(() => deriveAssigneeCompletion(tasks, team), [tasks, team]);

  return { statistics, assigneeCompletion };
};
