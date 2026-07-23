import GanttView from '../components/GanttView';
import ProjectScopeSelector from '../components/ProjectScopeSelector';
import TaskDetailPanel from '../components/TaskDetailPanel';
import { useProjectTaskSelection } from '../features/issue/useProjectTaskSelection';
import { useProjectViewData } from '../features/issue/useProjectViewData';
import ProjectScopedContent from '../features/project/components/ProjectScopedContent';
import { PageHeader } from '../components/ui';

export default function TimelinePage() {
  const view = useProjectViewData();
  const selection = useProjectTaskSelection(view.tasks, view.selectedProjectId);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="交付規劃" title="交付時間軸" description="比較工作開始與到期時間，辨識日期集中與交付風險。" />
      <ProjectScopeSelector
        projects={view.projects}
        value={view.selectedProjectId}
        onChange={view.setSelectedProjectId}
        loading={view.scopeLoading}
        error={view.error}
        onRetry={view.retry}
        readOnlyMessage={!view.loading && view.selectedProject && !view.canWrite ? (view.selectedProject.status === "archived" ? "此專案已封存，時程保留供查閱。" : "你的專案角色可檢視時程，但不能編輯工作項目。") : ""}
      />
      <ProjectScopedContent loading={view.loading} error={view.error} project={view.selectedProject} loadingLabel="載入交付時間軸…">
        <GanttView tasks={view.tasks} onTaskClick={(task) => selection.selectTask(task.id)} showHeader={false} />
      </ProjectScopedContent>
      <TaskDetailPanel task={selection.selectedTask} team={view.team} statusOptions={view.statusOptions} onClose={selection.clearSelection} onUpdate={view.canWrite ? view.updateTask : undefined} />
    </div>
  );
}
