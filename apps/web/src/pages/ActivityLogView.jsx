import { Activity, CirclePlus, RefreshCw, Users } from "lucide-react";
import { Alert, Button, PageHeader, StatCard } from "../components/ui";
import ActivityFilters from "../features/activity/components/ActivityFilters";
import ActivityList from "../features/activity/components/ActivityList";
import { useActivityWorkspace } from "../features/activity/useActivityWorkspace";

export default function ActivityLogView() {
  const workspace = useActivityWorkspace();

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="稽核與治理"
        title="活動紀錄"
        description="查看你可存取專案中的 Issue 建立、更新、指派、留言與狀態變化。"
        actions={(
          <Button variant="secondary" onClick={workspace.refresh} disabled={workspace.loading || workspace.refreshing}>
            <RefreshCw className={workspace.refreshing ? "animate-spin motion-reduce:animate-none" : ""} size={17} aria-hidden="true" />
            {workspace.refreshing ? "整理中…" : "重新整理"}
          </Button>
        )}
      />

      {workspace.error ? <Alert tone="error" title="活動紀錄未完整更新">{workspace.error}</Alert> : null}

      {!workspace.loading && workspace.activities.length ? (
        <section aria-label="活動摘要" className="grid gap-4 sm:grid-cols-3">
          <StatCard label="活動總數" value={workspace.activities.length} icon={Activity} />
          <StatCard label="建立 Issue" value={workspace.createdCount} icon={CirclePlus} />
          <StatCard label="參與者" value={workspace.actors.length} icon={Users} />
        </section>
      ) : null}

      <ActivityFilters
        actionTypes={workspace.actionTypes}
        actors={workspace.actors}
        filterAction={workspace.filterAction}
        filterActor={workspace.filterActor}
        sortOrder={workspace.sortOrder}
        filtersActive={workspace.filtersActive}
        disabled={workspace.loading}
        onActionChange={workspace.setFilterAction}
        onActorChange={workspace.setFilterActor}
        onSortChange={workspace.setSortOrder}
        onReset={workspace.resetFilters}
      />

      <ActivityList
        activities={workspace.filteredActivities}
        allCount={workspace.activities.length}
        loading={workspace.loading}
      />
    </div>
  );
}
