import { useState } from "react";
import { ArrowLeft, CalendarRange, Eye, Flag, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../../../components/Modal";
import { Alert, Badge, Button, Card, EmptyState, LoadingState, PageHeader } from "../../../components/ui";
import { buttonClass } from "../../../components/ui/styles";
import { useProjectPlanningWorkspace } from "../useProjectPlanningWorkspace";
import ProjectPlanningDialog from "./ProjectPlanningDialog";

const planningConfig = {
  milestone: {
    eyebrow: "交付規劃",
    title: "里程碑",
    singular: "里程碑",
    icon: Flag,
    emptyTitle: "尚未建立里程碑",
    emptyDescription: "建立第一個關鍵節點，讓團隊知道下一個重要成果與日期。",
    readOnlyArchived: "此專案已封存，既有里程碑保留檢視但不再新增交付節點。",
    readOnlyRole: "新增里程碑需要此專案的協作者或專案管理員角色。",
  },
  sprint: {
    eyebrow: "迭代規劃",
    title: "Sprint",
    singular: "Sprint",
    icon: CalendarRange,
    emptyTitle: "尚未建立 Sprint",
    emptyDescription: "建立第一個迭代週期，讓團隊對時間範圍與成果有共同預期。",
    readOnlyArchived: "此專案已封存，既有 Sprint 保留檢視但不再建立新週期。",
    readOnlyRole: "建立 Sprint 需要此專案的協作者或專案管理員角色。",
  },
};

const toDateInput = (value) => value ? String(value).slice(0, 10) : "";

const getMilestoneState = (milestone) => {
  if (milestone.status === "completed") return { label: "已完成", tone: "success" };
  if (!milestone.dueAt) return { label: "未設定日期", tone: "neutral" };
  const days = Math.ceil((new Date(milestone.dueAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: `逾期 ${Math.abs(days)} 天`, tone: "danger" };
  if (days <= 7) return { label: days === 0 ? "今天到期" : `剩餘 ${days} 天`, tone: "warning" };
  return { label: `剩餘 ${days} 天`, tone: "brand" };
};

const getSprintState = (sprint) => {
  if (sprint.status === "completed") return { label: "已完成", tone: "success" };
  const now = new Date();
  const start = sprint.startAt ? new Date(sprint.startAt) : null;
  const end = sprint.endAt ? new Date(sprint.endAt) : null;
  if (end && end < now) return { label: "已到期", tone: "danger" };
  if (start && start <= now && (!end || end >= now)) return { label: "進行中", tone: "brand" };
  return { label: "已規劃", tone: "neutral" };
};

function PlanningCard({ kind, item, onView }) {
  const milestone = kind === "milestone";
  const state = milestone ? getMilestoneState(item) : getSprintState(item);
  const schedule = milestone
    ? `截止日期：${toDateInput(item.dueAt) || "未設定"}`
    : `${toDateInput(item.startAt) || "未設定開始日"} — ${toDateInput(item.endAt) || "未設定結束日"}`;

  return (
    <Card as="article" className="flex min-h-52 flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-ink">{item.name}</h2>
          <p className="mt-2 text-sm text-body">{schedule}</p>
        </div>
        <Badge tone={state.tone}>{state.label}</Badge>
      </div>
      {!milestone ? <p className="mt-5 line-clamp-2 text-sm leading-6 text-body">{item.goal || "尚未設定 Sprint 目標。"}</p> : null}
      <div className="mt-auto border-t border-line-soft pt-4">
        <Button variant="outline" size="sm" onClick={onView}><Eye size={16} aria-hidden="true" />查看詳情</Button>
      </div>
    </Card>
  );
}

export default function ProjectPlanningWorkspace({ projectId, kind }) {
  const workspace = useProjectPlanningWorkspace(projectId, kind);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const config = planningConfig[kind];
  const PlanningIcon = config.icon;

  const description = workspace.project
    ? `${workspace.project.key} — ${workspace.project.name} 的${kind === "milestone" ? "關鍵交付節點" : "迭代週期與交付目標"}。`
    : `規劃${kind === "milestone" ? "重要成果與交付日期" : "有明確成果的團隊工作週期"}。`;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={config.eyebrow}
        title={`${config.title}管理`}
        description={description}
        actions={
          <>
            {projectId ? <Link to={`/projects/${projectId}`} className={buttonClass({ variant: "secondary" })}><ArrowLeft size={17} aria-hidden="true" />專案工作區</Link> : null}
            {workspace.canWrite ? <Button onClick={() => setCreateOpen(true)}><Plus size={17} aria-hidden="true" />新增{config.singular}</Button> : null}
          </>
        }
      />

      {workspace.error ? (
        <Alert tone="error" title={`無法載入${config.title}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{workspace.error}</span>
            <Button variant="outline" size="sm" onClick={workspace.refresh}><RefreshCw size={16} aria-hidden="true" />重新載入</Button>
          </div>
        </Alert>
      ) : null}
      {workspace.notice ? <Alert tone="success">{workspace.notice}</Alert> : null}
      {!projectId ? <Alert tone="info">請先從專案頁進入{config.title}管理。</Alert> : null}
      {workspace.projectArchived ? <Alert tone="info" title="唯讀模式">{config.readOnlyArchived}</Alert> : null}
      {workspace.project && !workspace.projectArchived && !workspace.canWrite ? <Alert tone="info" title="唯讀模式">{config.readOnlyRole}</Alert> : null}

      {workspace.loading ? <Card><LoadingState label={`載入${config.title}中…`} /></Card> : null}

      {!workspace.loading && workspace.items.length ? (
        <section className="grid gap-4 lg:grid-cols-2" aria-label={`${config.title}清單`}>
          {workspace.items.map((item) => (
            <PlanningCard key={item.id} kind={kind} item={item} onView={() => setSelectedItem(item)} />
          ))}
        </section>
      ) : null}

      {!workspace.loading && !workspace.error && !workspace.items.length ? (
        <Card>
          <EmptyState
            icon={PlanningIcon}
            title={config.emptyTitle}
            description={config.emptyDescription}
            action={workspace.canWrite ? <Button onClick={() => setCreateOpen(true)}>新增{config.singular}</Button> : null}
          />
        </Card>
      ) : null}

      <ProjectPlanningDialog
        kind={kind}
        projectName={workspace.project?.name ?? "目前專案"}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={workspace.createItem}
        saving={workspace.saving}
        error={workspace.createError}
        onClearError={workspace.clearCreateError}
        showSchedule
      />

      <Modal isOpen={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} title={selectedItem?.name || `${config.title}詳情`}>
        {selectedItem ? (
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">狀態</dt>
              <dd className="mt-1 font-semibold text-ink">{kind === "milestone" ? getMilestoneState(selectedItem).label : getSprintState(selectedItem).label}</dd>
            </div>
            {kind === "milestone" ? (
              <div>
                <dt className="text-sm text-muted">截止日期</dt>
                <dd className="mt-1 font-semibold text-ink">{toDateInput(selectedItem.dueAt) || "未設定"}</dd>
              </div>
            ) : (
              <>
                <div>
                  <dt className="text-sm text-muted">日期</dt>
                  <dd className="mt-1 font-semibold text-ink">{toDateInput(selectedItem.startAt) || "未設定"} — {toDateInput(selectedItem.endAt) || "未設定"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted">目標</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-7 text-ink">{selectedItem.goal || "未設定"}</dd>
                </div>
              </>
            )}
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}
