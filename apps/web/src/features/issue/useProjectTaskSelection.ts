import { useEffect, useMemo, useState } from "react";
import type { ProjectTaskView } from "./useProjectViewData";

export const useProjectTaskSelection = (tasks: ProjectTaskView[], projectId?: string | null) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTaskId(null);
  }, [projectId]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  return {
    selectedTask,
    selectTask: setSelectedTaskId,
    clearSelection: () => setSelectedTaskId(null),
  };
};
