import { useState } from "react";
import { FolderKanban, Plus, RefreshCw } from "lucide-react";
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import ProjectArchiveDialog from "../features/project/components/ProjectArchiveDialog";
import ProjectCreateDialog from "../features/project/components/ProjectCreateDialog";
import ProjectNavigator from "../features/project/components/ProjectNavigator";
import ProjectOverview from "../features/project/components/ProjectOverview";
import ProjectPlanningDialog from "../features/project/components/ProjectPlanningDialog";
import { useProjectsWorkspace } from "../features/project/useProjectsWorkspace";

export default function Projects() {
  const workspace = useProjectsWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [planningKind, setPlanningKind] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="專案組合"
        title="專案"
        description="先掌握交付組合，再進入單一專案安排里程碑、Sprint 與團隊工作。"
        actions={workspace.canCreateProject ? (
          <Button onClick={() => { workspace.clearFeedback(); setCreateOpen(true); }}>
            <Plus size={17} aria-hidden="true" />建立專案
          </Button>
        ) : null}
      />

      <div aria-live="polite" className="space-y-3">
        {workspace.error ? (
          <Alert tone="error" title="無法載入專案">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{workspace.error}</span>
              <Button variant="outline" size="sm" onClick={workspace.refresh}>
                <RefreshCw size={16} aria-hidden="true" />重新載入
              </Button>
            </div>
          </Alert>
        ) : null}
        {workspace.notice ? <Alert tone="success">{workspace.notice}</Alert> : null}
      </div>

      {workspace.loading ? <Card><LoadingState label="載入專案中…" /></Card> : null}

      {!workspace.loading && workspace.projects.length ? (
        <section className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]" aria-label="專案組合與目前專案">
          <ProjectNavigator
            projects={workspace.projects}
            filteredProjects={workspace.filteredProjects}
            selectedProjectId={workspace.selectedProjectId}
            onSelectProject={workspace.selectProject}
            keyword={workspace.keyword}
            onKeywordChange={workspace.setKeyword}
            activeCount={workspace.activeCount}
          />

          {workspace.selectedProject ? (
            <ProjectOverview
              project={workspace.selectedProject}
              canContribute={workspace.canContribute}
              canAdminister={workspace.canAdminister}
              onCreateMilestone={() => setPlanningKind("milestone")}
              onCreateSprint={() => setPlanningKind("sprint")}
              onArchive={() => { workspace.clearArchiveError(); setArchiveTarget(workspace.selectedProject); }}
            />
          ) : null}
        </section>
      ) : null}

      {!workspace.loading && !workspace.projects.length && !workspace.error ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title="還沒有專案"
            description={workspace.canCreateProject ? "建立第一個專案，開始整理交付範圍與團隊工作。" : "目前沒有你可以查看的專案。"}
            action={workspace.canCreateProject ? (
              <Button onClick={() => setCreateOpen(true)}><Plus size={17} aria-hidden="true" />建立第一個專案</Button>
            ) : null}
          />
        </Card>
      ) : null}

      <ProjectCreateDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={workspace.createProject}
        saving={workspace.busyAction === "project"}
        error={workspace.createError}
        errorField={workspace.createErrorField}
        onClearError={workspace.clearCreateError}
      />

      <ProjectPlanningDialog
        kind={planningKind || "milestone"}
        projectName={workspace.selectedProject?.name ?? "目前專案"}
        isOpen={Boolean(planningKind)}
        onClose={() => setPlanningKind("")}
        onCreate={planningKind === "sprint" ? workspace.createSprint : workspace.createMilestone}
        saving={workspace.busyAction === planningKind}
        error={planningKind === "sprint" ? workspace.sprintError : workspace.milestoneError}
        onClearError={planningKind === "sprint" ? workspace.clearSprintError : workspace.clearMilestoneError}
      />

      <ProjectArchiveDialog
        project={archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={workspace.archiveProject}
        saving={workspace.busyAction === "archive"}
        error={workspace.archiveError}
        onClearError={workspace.clearArchiveError}
      />
    </div>
  );
}
