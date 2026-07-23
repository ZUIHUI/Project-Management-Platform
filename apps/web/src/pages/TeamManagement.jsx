import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import ProjectScopeSelector from "../components/ProjectScopeSelector";
import { Alert, Button, Card, LoadingState, PageHeader } from "../components/ui";
import ProjectRoleGuide from "../features/project/components/ProjectRoleGuide";
import TeamMemberDialog from "../features/project/components/TeamMemberDialog";
import TeamMemberList from "../features/project/components/TeamMemberList";
import { useTeamWorkspace } from "../features/project/useTeamWorkspace";

export default function TeamManagement() {
  const workspace = useTeamWorkspace();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="團隊與權限"
        title="團隊與權限"
        description="先選擇專案，再以最小必要權限管理每位成員的角色。"
        actions={workspace.canManage ? (
          <Button onClick={() => { workspace.clearAddError(); setAddOpen(true); }}>
            <Plus size={17} aria-hidden="true" />新增成員
          </Button>
        ) : null}
      />

      {workspace.projects.length ? (
        <ProjectScopeSelector
          projects={workspace.projects}
          value={workspace.selectedProjectId}
          onChange={workspace.selectProject}
          loading={workspace.loading}
          error=""
        />
      ) : null}

      <div aria-live="polite" className="space-y-3">
        {workspace.error ? (
          <Alert tone="error" title="操作未完成">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{workspace.error}</span>
              <Button variant="outline" size="sm" onClick={workspace.refresh}><RefreshCw size={16} aria-hidden="true" />重新載入</Button>
            </div>
          </Alert>
        ) : null}
        {workspace.notice ? <Alert tone="success">{workspace.notice}</Alert> : null}
      </div>

      {workspace.selectedProject?.status === "archived" ? (
        <Alert tone="info" title="唯讀模式">此專案已封存，成員與角色保留檢視但不再接受調整。</Alert>
      ) : null}
      {workspace.selectedProject && workspace.selectedProject.status !== "archived" && !workspace.canManage ? (
        <Alert tone="info" title="瀏覽模式">只有此專案的專案管理員可新增成員或變更權限。</Alert>
      ) : null}

      {workspace.loading ? <Card><LoadingState label="載入團隊資料中…" /></Card> : null}

      {!workspace.loading ? (
        <TeamMemberList
          members={workspace.members}
          selectedProjectId={workspace.selectedProjectId}
          canManage={workspace.canManage}
          busyMemberIds={workspace.busyMemberIds}
          onSaveRole={workspace.updateMemberRole}
          onAddMember={() => setAddOpen(true)}
        />
      ) : null}

      <ProjectRoleGuide />

      <TeamMemberDialog
        isOpen={addOpen}
        projectName={workspace.selectedProject?.name ?? "目前專案"}
        onClose={() => setAddOpen(false)}
        onAdd={workspace.addMember}
        saving={workspace.addingMember}
        error={workspace.addError}
        errorField={workspace.addErrorField}
        onClearError={workspace.clearAddError}
      />
    </div>
  );
}
