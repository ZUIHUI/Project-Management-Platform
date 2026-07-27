import BoardView from "../../../components/BoardView";
import CalendarView from "../../../components/CalendarView";
import GanttView from "../../../components/GanttView";
import ProjectIssueList from "./ProjectIssueList";
import { projectViewPanelId, projectViewTabId } from "./projectViewConfig";

export default function ProjectWorkspaceContent({
  selectedView,
  project,
  tasks,
  statusOptions,
  canEdit,
  transitioningTaskIds,
  onSelectTask,
  onTransitionTask,
}) {
  const selectTask = (task) => onSelectTask(task.id);

  return (
    <div
      id={projectViewPanelId}
      role="tabpanel"
      aria-labelledby={projectViewTabId(selectedView)}
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {selectedView === "board" ? (
        <BoardView
          projectId={project.name}
          tasks={tasks}
          statusOptions={statusOptions}
          transitioningTaskIds={transitioningTaskIds}
          onTaskClick={selectTask}
          onStatusChange={canEdit ? onTransitionTask : undefined}
          showHeader={false}
        />
      ) : null}
      {selectedView === "calendar" ? (
        <CalendarView tasks={tasks} onTaskClick={selectTask} showHeader={false} />
      ) : null}
      {selectedView === "timeline" ? (
        <GanttView tasks={tasks} onTaskClick={selectTask} showHeader={false} />
      ) : null}
      {selectedView === "list" ? (
        <ProjectIssueList
          tasks={tasks}
          projectId={project.id}
          canEdit={canEdit}
          onSelectTask={onSelectTask}
        />
      ) : null}
    </div>
  );
}
