import { Archive, ArrowRight, CalendarRange, Flag, ListTodo, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, CardHeader, IconButton } from "../../../components/ui";
import { buttonClass, cn } from "../../../components/ui/styles";

const metrics = [
  { key: "milestones", label: "里程碑", icon: Flag },
  { key: "sprints", label: "Sprint", icon: CalendarRange },
  { key: "members", label: "成員", icon: Users },
];

function PlanningRow({ icon, title, description, managePath, actionLabel, onAction, canContribute }) {
  const PlanningIcon = icon;
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-strong text-ink">
        <PlanningIcon size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-body">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canContribute ? <Button variant="outline" size="sm" onClick={onAction}>{actionLabel}</Button> : null}
        <Link to={managePath} className={buttonClass({ variant: "ghost", size: "sm" })}>
          {canContribute ? "管理全部" : "查看全部"}
        </Link>
      </div>
    </div>
  );
}

export default function ProjectOverview({
  project,
  canContribute,
  canAdminister,
  onCreateMilestone,
  onCreateSprint,
  onArchive,
}) {
  const archived = project.status === "archived";
  const milestoneCount = project.milestones?.length ?? 0;
  const sprintCount = project.sprints?.length ?? 0;

  return (
    <div className="min-w-0 space-y-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="brand">{project.key}</Badge>
              <Badge tone={archived ? "neutral" : "success"}>{archived ? "已封存" : "進行中"}</Badge>
            </div>
            <h2 className="mt-4 font-display text-3xl font-normal tracking-tight text-ink">{project.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-body">{project.description || "尚未提供專案說明。"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/projects/${project.id}`} className={buttonClass({ variant: "primary" })}>
              開啟工作區<ArrowRight size={17} aria-hidden="true" />
            </Link>
            {canAdminister ? (
              <IconButton label={`封存 ${project.name}`} className="border border-line" onClick={onArchive}>
                <Archive size={18} aria-hidden="true" />
              </IconButton>
            ) : null}
          </div>
        </div>

        <div className="grid border-t border-line-soft sm:grid-cols-3">
          {metrics.map((metric, index) => {
            const MetricIcon = metric.icon;
            const value = project[metric.key]?.length ?? 0;
            return (
              <div key={metric.key} className={cn("flex items-center gap-3 px-5 py-4 sm:px-6", index > 0 && "border-t border-line-soft sm:border-l sm:border-t-0")}>
                <MetricIcon size={18} className="text-muted" aria-hidden="true" />
                <span className="text-sm text-body">{metric.label}</span>
                <span className="ml-auto font-mono text-lg font-medium text-ink">{value}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {archived ? (
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-strong text-body">
              <Archive size={19} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-semibold text-ink">此專案為唯讀狀態</h3>
              <p className="mt-1 text-sm leading-6 text-body">既有里程碑、Sprint 與 Issue 仍可查看，但封存後不再接受新的交付內容。</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader title="交付節奏" description="查看可驗收成果與團隊工作週期。" />
        <div className="divide-y divide-line-soft">
          <PlanningRow
            icon={Flag}
            title="里程碑"
            description={milestoneCount ? `目前有 ${milestoneCount} 個交付節點。` : "尚未建立里程碑，先定義第一個可驗收成果。"}
            managePath={`/projects/${project.id}/milestone`}
            actionLabel="新增里程碑"
            onAction={onCreateMilestone}
            canContribute={canContribute}
          />
          <PlanningRow
            icon={CalendarRange}
            title="Sprint"
            description={sprintCount ? `目前有 ${sprintCount} 個工作週期。` : "尚未建立 Sprint，可從下一段明確目標開始。"}
            managePath={`/projects/${project.id}/sprint`}
            actionLabel="新增 Sprint"
            onAction={onCreateSprint}
            canContribute={canContribute}
          />
        </div>
        {!canContribute ? (
          <div className="flex items-start gap-3 border-t border-line-soft bg-surface px-5 py-4 text-sm text-body sm:px-6">
            <ListTodo className="mt-0.5 shrink-0 text-muted" size={18} aria-hidden="true" />
            <p>{archived
              ? "此專案已封存；你仍可查看既有里程碑、Sprint 與 Issue，但無法新增交付內容。"
              : "你可以查看既有里程碑、Sprint 與 Issue；新增或調整交付內容需要此專案的協作者或專案管理員角色。"}</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
