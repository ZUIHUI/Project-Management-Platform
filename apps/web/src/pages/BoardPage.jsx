import BoardView from '../components/BoardView';
import ProjectScopeSelector from '../components/ProjectScopeSelector';
import TaskDetailPanel from '../components/TaskDetailPanel';
import { useProjectTaskSelection } from '../features/issue/useProjectTaskSelection';
import { useProjectViewData } from '../features/issue/useProjectViewData';
import ProjectScopedContent from '../features/project/components/ProjectScopedContent';
import { Alert, PageHeader } from '../components/ui';

export default function BoardPage() {
  const view = useProjectViewData();
  const selection = useProjectTaskSelection(view.tasks, view.selectedProjectId);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="交付規劃" title="跨專案看板" description="依專案切換工作範圍，拖曳或用狀態選單推進 Issue。" />
      <ProjectScopeSelector
        projects={view.projects}
        value={view.selectedProjectId}
        onChange={view.setSelectedProjectId}
        loading={view.scopeLoading}
        error={view.error}
        onRetry={view.retry}
        readOnlyMessage={!view.loading && view.selectedProject && !view.canWrite ? (view.selectedProject.status === "archived" ? "此專案已封存，工作看板保留供查閱。" : "你的專案角色可檢視工作看板，但不能移動或編輯工作項目。") : ""}
      />
      {view.operationError ? <Alert tone="error" title="Issue 操作未完成">{view.operationError}</Alert> : null}
      {view.notice ? <Alert tone="success">{view.notice}</Alert> : null}
      <ProjectScopedContent loading={view.loading} error={view.error} project={view.selectedProject} loadingLabel="載入工作看板…">
        <BoardView
          projectId={view.selectedProject?.name ?? view.selectedProjectId}
          tasks={view.tasks}
          statusOptions={view.statusOptions}
          transitioningTaskIds={view.transitioningIssueIds}
          onTaskClick={(task) => selection.selectTask(task.id)}
          onStatusChange={view.canUseWorkflow ? view.transitionTask : undefined}
          showHeader={false}
        />
      </ProjectScopedContent>
      <TaskDetailPanel
        task={selection.selectedTask}
        team={view.team}
        statusOptions={view.statusOptions}
        transitioning={view.transitioningIssueIds.includes(selection.selectedTask?.id)}
        onClose={selection.clearSelection}
        onUpdate={view.canWrite ? view.updateTask : undefined}
        onTransition={view.canUseWorkflow ? view.transitionTask : undefined}
      />
    </div>
  );
}
