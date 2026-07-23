import { useMemo } from "react";
import type { ProjectTaskView } from "../issue/useProjectViewData";
import { deriveWorkloadMetrics, type WorkloadTeamMember } from "./workloadMetrics";

export const useWorkloadMetrics = (
  tasks: ProjectTaskView[],
  team: WorkloadTeamMember[],
) => useMemo(() => deriveWorkloadMetrics(tasks, team), [tasks, team]);
