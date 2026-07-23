import InsightsComponent from '../pages/InsightsPage';
import ProjectScopeSelector from '../components/ProjectScopeSelector';
import { useProjectViewData } from '../features/issue/useProjectViewData';
import ProjectScopedContent from '../features/project/components/ProjectScopedContent';
import { PageHeader } from '../components/ui';

export default function InsightsPageWrapper() {
  const view = useProjectViewData();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="交付洞察" title="交付洞察" description="從進度、逾期與成員分布辨識下一個需要處理的風險。" />
      <ProjectScopeSelector
        projects={view.projects}
        value={view.selectedProjectId}
        onChange={view.setSelectedProjectId}
        loading={view.scopeLoading}
        error={view.error}
        onRetry={view.retry}
      />
      <ProjectScopedContent loading={view.loading} error={view.error} project={view.selectedProject} loadingLabel="計算專案洞察…">
        <InsightsComponent projectId={view.selectedProjectId} tasks={view.tasks} team={view.team} showHeader={false} />
      </ProjectScopedContent>
    </div>
  );
}
