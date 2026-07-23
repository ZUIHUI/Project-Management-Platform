import { useState } from "react";
import { ArrowLeft, FolderX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import TaskDetailPanel from "../components/TaskDetailPanel";
import { Alert, Badge, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { buttonClass } from "../components/ui/styles";
import { useProjectViewData } from "../features/issue/useProjectViewData";
import { useProjectTaskSelection } from "../features/issue/useProjectTaskSelection";
import { canAccessProject } from "../features/project";
import ProjectViewTabs from "../features/project/components/ProjectViewTabs";
import ProjectWorkspaceContent from "../features/project/components/ProjectWorkspaceContent";

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const [selectedView, setSelectedView] = useState("board");
  const view = useProjectViewData(projectId);
  const selection = useProjectTaskSelection(view.tasks, view.selectedProjectId);
  const projectArchived = view.selectedProject?.status === "archived";
  const canEditProject = canAccessProject(view.selectedProject, "write") && !projectArchived;
  const projectTitle = view.selectedProject?.name ?? (projectId ? `專案 ${projectId}` : "專案工作區");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={view.selectedProject?.key ?? "專案工作區"}
        title={projectTitle}
        description={view.selectedProject?.description || "集中檢視 Issue、交付時程與工作狀態。"}
        actions={(
          <>
            <Link to="/projects" className={buttonClass({ variant: "secondary" })}>
              <ArrowLeft size={17} aria-hidden="true" />所有專案
            </Link>
            {canEditProject ? (
              <Link to={`/projects/${view.selectedProject.id}/issues`} className={buttonClass({ variant: "primary" })}>
                管理 Issue
              </Link>
            ) : null}
          </>
        )}
      >
        {view.selectedProject ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={projectArchived ? "neutral" : "success"}>
              {projectArchived ? "已封存" : "進行中"}
            </Badge>
            <Badge>{view.loading ? "Issue 載入中" : `${view.tasks.length} 個 Issue`}</Badge>
            <Badge>{view.team.length} 位成員</Badge>
          </div>
        ) : null}
      </PageHeader>

      {view.error ? (
        <Alert tone="error" title="無法載入專案工作區">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{view.error}</span>
            <Button variant="secondary" className="w-full shrink-0 sm:w-auto" onClick={view.retry}>
              重新載入
            </Button>
          </div>
        </Alert>
      ) : null}

      {view.selectedProject && !canEditProject ? (
        <Alert tone="info" title="唯讀模式">
          {projectArchived
            ? "此專案已封存，可保留檢視但不再接受交付內容更新。"
            : "你可以檢視專案、Issue 與交付日期；更新內容需要此專案的協作者或專案管理員角色。"}
        </Alert>
      ) : null}

      {view.loading ? <Card><LoadingState label="載入專案工作中…" /></Card> : null}

      {!view.loading && !view.selectedProject ? (
        <Card>
          <EmptyState
            icon={FolderX}
            title="找不到可存取的專案"
            description="專案可能不存在，或目前帳號尚未取得檢視權限。"
            action={<Button as={Link} to="/projects" variant="secondary">返回所有專案</Button>}
          />
        </Card>
      ) : null}

      {!view.loading && view.selectedProject ? (
        <>
          <ProjectViewTabs value={selectedView} onChange={setSelectedView} />
          <ProjectWorkspaceContent
            selectedView={selectedView}
            project={view.selectedProject}
            tasks={view.tasks}
            statusOptions={view.statusOptions}
            canEdit={canEditProject}
            onSelectTask={selection.selectTask}
            onTransitionTask={view.transitionTask}
          />
        </>
      ) : null}

      <TaskDetailPanel
        task={selection.selectedTask}
        team={view.team}
        statusOptions={view.statusOptions}
        onClose={selection.clearSelection}
        onUpdate={canEditProject ? view.updateTask : undefined}
      />
    </div>
  );
}
