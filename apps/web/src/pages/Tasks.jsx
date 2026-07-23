import { useEffect, useMemo, useState } from "react";
import { ListChecks, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import BoardView from "../components/BoardView";
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import IssueCreateDialog from "../features/issue/components/IssueCreateDialog";
import IssueDetailWorkspace from "../features/issue/components/IssueDetailWorkspace";
import IssueList from "../features/issue/components/IssueList";
import IssueWorkspaceToolbar from "../features/issue/components/IssueWorkspaceToolbar";
import { useIssueRouteState } from "../features/issue/useIssueRouteState";
import { useIssueWorkspace } from "../features/issue/useIssueWorkspace";
import { buildWorkflowStatusOptions } from "../features/issue/workflowPresentation.js";
import { buildProjectMemberLabelMap } from "../features/project/projectMemberPresentation";
import { useMediaQuery } from "../shared/useMediaQuery";

export default function Tasks({ viewMode = "list" }) {
  const { projectId: routeProjectId } = useParams();
  const workspace = useIssueWorkspace(routeProjectId);
  const isDesktopDetail = useMediaQuery("(min-width: 1280px)");
  const routeState = useIssueRouteState({
    projectId: workspace.projectId,
    issues: workspace.issues,
    issuesLoading: workspace.issuesLoading,
    issuesResolvedProjectId: workspace.issuesResolvedProjectId,
    selectedIssueId: workspace.selectedIssueId,
    setSelectedIssueId: workspace.setSelectedIssueId,
    clearDetailFeedback: workspace.clearDetailFeedback,
    isDesktopDetail,
    viewMode,
  });
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setKeyword("");
  }, [workspace.projectId]);

  const filteredIssues = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return workspace.issues;
    return workspace.issues.filter((issue) => (
      `${issue.number} ${issue.title} ${issue.description ?? ""}`.toLowerCase().includes(query)
    ));
  }, [keyword, workspace.issues]);

  const statusOptions = useMemo(() => buildWorkflowStatusOptions(workspace.statuses), [workspace.statuses]);
  const memberLabels = useMemo(
    () => buildProjectMemberLabelMap(workspace.selectedProject?.members ?? []),
    [workspace.selectedProject?.members],
  );
  const boardTasks = useMemo(
    () => filteredIssues.map((issue) => ({
      ...issue,
      assignee: issue.assigneeId ?? null,
      assigneeLabel: issue.assigneeId ? memberLabels.get(issue.assigneeId) ?? issue.assigneeId : null,
      dueDate: issue.dueAt ?? null,
    })),
    [filteredIssues, memberLabels],
  );

  const openCreateDialog = () => {
    if (!workspace.canUseWorkflow) return;
    workspace.clearCreateError();
    setCreateOpen(true);
  };

  const createIssue = async (draft) => {
    const newIssue = await workspace.createIssue(draft);
    if (!newIssue) return false;
    routeState.selectIssue(newIssue.id);
    return true;
  };

  if (workspace.loading) return <LoadingState label="正在準備 Issue 工作區…" />;

  const detailProps = {
    issue: workspace.selectedIssue,
    statuses: workspace.statuses,
    members: workspace.selectedProject?.members ?? [],
    comments: workspace.comments,
    activityLogs: workspace.activityLogs,
    canModify: workspace.canModify,
    loading: workspace.detailLoading,
    saving: workspace.detailSaving,
    error: workspace.detailError,
    notice: workspace.detailNotice,
    onAssign: workspace.assignIssue,
    onComment: workspace.addComment,
    onRetry: workspace.reloadDetails,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="工作管理"
        title={viewMode === "board" ? "Issue 看板" : "Issue 清單"}
        description="從建立、指派到狀態流轉，在同一個工作區完成並保留討論脈絡。"
        actions={workspace.canUseWorkflow ? (
          <Button onClick={openCreateDialog}><Plus size={18} aria-hidden="true" />建立 Issue</Button>
        ) : null}
      />

      {workspace.error ? (
        <Alert tone="error" title="工作區載入或更新未完成">
          {workspace.error}
          <button type="button" className="ml-2 font-semibold underline" onClick={workspace.reloadIssues}>重試</button>
        </Alert>
      ) : null}
      {workspace.notice ? <Alert tone="success">{workspace.notice}</Alert> : null}
      {routeState.routeNotice ? <Alert tone="info">{routeState.routeNotice}</Alert> : null}
      {workspace.selectedProject && !workspace.workflowReady ? (
        <Alert tone="error" title="工作流程尚未就緒">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>平台正在準備標準工作流程；目前可查看專案，但暫時無法建立或移動 Issue。</span>
            <Button variant="outline" size="sm" onClick={workspace.reloadWorkspace}>重新檢查</Button>
          </div>
        </Alert>
      ) : null}
      {workspace.selectedProject?.status === "archived" ? (
        <Alert tone="info" title="唯讀模式">此專案已封存；Issue、留言、指派與狀態仍可查看，但不再接受更新。</Alert>
      ) : null}
      {workspace.selectedProject && workspace.selectedProject.status !== "archived" && !workspace.canModify ? (
        <Alert tone="info" title="瀏覽模式">你可以查看 Issue、留言與活動紀錄；建立、指派或推進狀態需要此專案的協作者或專案管理員角色。</Alert>
      ) : null}

      <IssueWorkspaceToolbar
        projects={workspace.projects}
        projectId={workspace.projectId}
        selectedProject={workspace.selectedProject}
        viewMode={viewMode}
        listHref={routeState.listHref}
        boardHref={routeState.boardHref}
        keyword={keyword}
        issueCount={workspace.issues.length}
        filteredCount={filteredIssues.length}
        onProjectChange={routeState.changeProject}
        onKeywordChange={setKeyword}
      />

      <IssueCreateDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createIssue}
        saving={workspace.creating}
        error={workspace.createError}
        onClearError={workspace.clearCreateError}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {workspace.issuesLoading ? (
            <Card><LoadingState label="載入 Issue…" /></Card>
          ) : !workspace.projectId ? (
            <Card><EmptyState icon={ListChecks} title="請先選擇專案" description="選擇專案後即可查看和管理 Issue。" /></Card>
          ) : viewMode === "board" ? (
            <BoardView
              projectId={workspace.selectedProject?.name ?? workspace.projectId}
              tasks={boardTasks}
              statusOptions={statusOptions}
              selectedTaskId={workspace.selectedIssueId}
              onTaskClick={(task) => routeState.selectIssue(task.id)}
              onStatusChange={workspace.canUseWorkflow ? workspace.transitionIssueStatus : undefined}
              showHeader={false}
            />
          ) : (
            <IssueList
              issues={filteredIssues}
              allIssueCount={workspace.issues.length}
              statuses={workspace.statuses}
              selectedIssueId={workspace.selectedIssueId}
              canModify={workspace.canUseWorkflow}
              onSelect={routeState.selectIssue}
              onMove={workspace.moveIssue}
              onCreate={openCreateDialog}
            />
          )}
        </div>

        {isDesktopDetail ? <IssueDetailWorkspace mode="aside" {...detailProps} /> : null}
      </div>

      {!isDesktopDetail ? (
        <IssueDetailWorkspace
          mode="dialog"
          isOpen={routeState.detailOpen}
          onClose={routeState.closeDetail}
          {...detailProps}
        />
      ) : null}
    </div>
  );
}
