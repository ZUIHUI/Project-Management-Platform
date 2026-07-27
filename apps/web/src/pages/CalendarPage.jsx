import CalendarView from '../components/CalendarView';
import ProjectScopeSelector from '../components/ProjectScopeSelector';
import TaskDetailPanel from '../components/TaskDetailPanel';
import { useProjectTaskSelection } from '../features/issue/useProjectTaskSelection';
import { useProjectViewData } from '../features/issue/useProjectViewData';
import ProjectScopedContent from '../features/project/components/ProjectScopedContent';
import { Alert, PageHeader } from '../components/ui';

export default function CalendarPage() {
  const view = useProjectViewData();
  const selection = useProjectTaskSelection(view.tasks, view.selectedProjectId);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="交付規劃" title="交付行事曆" description="以到期日檢視每月安排，快速開啟 Issue 詳情調整內容。" />
      <ProjectScopeSelector
        projects={view.projects}
        value={view.selectedProjectId}
        onChange={view.setSelectedProjectId}
        loading={view.scopeLoading}
        error={view.error}
        onRetry={view.retry}
        readOnlyMessage={!view.loading && view.selectedProject && !view.canWrite ? (view.selectedProject.status === "archived" ? "此專案已封存，行事曆保留供查閱。" : "你的專案角色可檢視行事曆，但不能編輯工作項目。") : ""}
      />
      {view.operationError ? <Alert tone="error" title="Issue 操作未完成">{view.operationError}</Alert> : null}
      {view.notice ? <Alert tone="success">{view.notice}</Alert> : null}
      <ProjectScopedContent loading={view.loading} error={view.error} project={view.selectedProject} loadingLabel="載入行事曆…">
        <CalendarView tasks={view.tasks} onTaskClick={(task) => selection.selectTask(task.id)} showHeader={false} />
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
