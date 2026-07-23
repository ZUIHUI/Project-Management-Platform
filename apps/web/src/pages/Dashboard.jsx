import { RefreshCw } from "lucide-react";
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import DashboardIssueList from "../features/dashboard/components/DashboardIssueList";
import DashboardMetricGrid from "../features/dashboard/components/DashboardMetricGrid";
import StatusBreakdownCard from "../features/dashboard/components/StatusBreakdownCard";
import { useDashboardWorkspace } from "../features/dashboard/useDashboardWorkspace";

const formatUpdatedAt = (value) => new Intl.DateTimeFormat("zh-TW", {
  hour: "2-digit",
  minute: "2-digit",
}).format(value);

export default function Dashboard() {
  const workspace = useDashboardWorkspace();
  const busy = workspace.loading || workspace.refreshing;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="交付營運"
        title="營運儀表板"
        description="從專案、Issue 與交付風險快速判斷團隊現在最需要處理的事情。"
        actions={(
          <Button variant="secondary" onClick={workspace.refresh} disabled={busy}>
            <RefreshCw
              size={17}
              className={busy ? "animate-spin motion-reduce:animate-none" : ""}
              aria-hidden="true"
            />
            {workspace.refreshing ? "更新中…" : "重新整理"}
          </Button>
        )}
      >
        {workspace.lastUpdatedAt ? (
          <p className="mt-2 text-xs text-muted">最近更新：{formatUpdatedAt(workspace.lastUpdatedAt)}</p>
        ) : null}
      </PageHeader>

      {workspace.error ? (
        <Alert tone="error" title={workspace.dashboard ? "更新失敗" : "資料載入失敗"}>
          {workspace.error}
        </Alert>
      ) : null}

      {workspace.loading ? (
        <Card><LoadingState label="正在整理交付指標…" /></Card>
      ) : null}

      {!workspace.loading && workspace.dashboard ? (
        <>
          <DashboardMetricGrid totals={workspace.dashboard.totals} />
          <StatusBreakdownCard
            items={workspace.dashboard.statusBreakdown}
            maxCount={workspace.maxStatusCount}
          />
          <section aria-label="工作清單" className="grid gap-4 xl:grid-cols-2">
            <DashboardIssueList
              title="進行中的工作"
              description="仍需要團隊推進的 Issue。"
              issues={workspace.dashboard.openIssues}
              emptyTitle="目前沒有進行中的工作"
              emptyDescription="新的 Issue 建立後會出現在這裡。"
              actionHref="/board"
              actionLabel="查看看板"
            />
            <DashboardIssueList
              title="逾期風險"
              description="已超過到期日且尚未完成的工作。"
              issues={workspace.dashboard.overdueIssues}
              risk
              emptyTitle="沒有逾期項目"
              emptyDescription="目前的交付節奏維持正常。"
              actionHref="/calendar"
              actionLabel="查看行事曆"
            />
          </section>
        </>
      ) : null}

      {!workspace.loading && !workspace.dashboard ? (
        <Card>
          <EmptyState
            title={workspace.error ? "暫時無法顯示儀表板" : "目前沒有儀表板資料"}
            description={workspace.error ? "請確認服務狀態後再試一次。" : "建立專案與 Issue 後即可開始追蹤交付狀態。"}
            action={workspace.error ? (
              <Button variant="secondary" onClick={workspace.retry}>重新載入</Button>
            ) : null}
          />
        </Card>
      ) : null}
    </div>
  );
}
