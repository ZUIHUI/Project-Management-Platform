import WorkloadWorkspace from '../features/workload/components/WorkloadWorkspace';
import ProjectScopeSelector from '../components/ProjectScopeSelector';
import { useProjectViewData } from '../features/issue/useProjectViewData';
import ProjectScopedContent from '../features/project/components/ProjectScopedContent';
import { PageHeader } from '../components/ui';

export default function WorkloadPage() {
  const view = useProjectViewData();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="工作分布" title="工作負載" description="比較 Issue 數量、在製工作與未指派項目；數量不等同工時或個人產能。" />
      <ProjectScopeSelector
        projects={view.projects}
        value={view.selectedProjectId}
        onChange={view.setSelectedProjectId}
        loading={view.scopeLoading}
        error={view.error}
        onRetry={view.retry}
      />
      <ProjectScopedContent loading={view.loading} error={view.error} project={view.selectedProject} loadingLabel="計算工作負載…">
        <WorkloadWorkspace tasks={view.tasks} team={view.team} showHeader={false} />
      </ProjectScopedContent>
    </div>
  );
}
