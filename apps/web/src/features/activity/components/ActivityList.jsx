import { Activity, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, EmptyState, LoadingState } from "../../../components/ui";
import {
  activityActionTones,
  formatActivityTime,
  getActivityActionLabel,
  presentActivity,
  presentActivityContext,
} from "../activityPresentation";

function ActivityItem({ activity }) {
  const presentation = presentActivity(activity);
  const context = presentActivityContext(activity);
  return (
    <article className="flex gap-4 px-5 py-5 sm:px-6">
      <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-strong text-ink"><Activity size={17} aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">{context.actorLabel}</span>
          {context.actorDetail ? <span className="break-all text-xs text-muted">{context.actorDetail}</span> : null}
          <Badge tone={activityActionTones[activity.action] ?? "neutral"}>{getActivityActionLabel(activity.action)}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-body">{presentation.summary}</p>

        <div className="mt-3 flex flex-col gap-3 rounded-control border border-line-soft bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs font-medium text-brand-active">{context.issueLabel}</p>
            <h2 className="mt-1 break-words text-sm font-semibold text-ink">{context.issueTitle}</h2>
            {context.projectLabel ? <p className="mt-1 text-xs text-muted">{context.projectLabel}</p> : null}
          </div>
          {context.issueHref ? (
            <Button as={Link} to={context.issueHref} variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
              查看 Issue<ExternalLink size={15} aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        {presentation.changes.length ? (
          <dl className="mt-4 space-y-2">
            {presentation.changes.map((change) => (
              <div key={change.field} className="rounded-control bg-surface p-3">
                <dt className="text-xs font-semibold text-ink">{change.label}</dt>
                <dd className="mt-2 flex flex-col gap-2 text-xs leading-5 text-body sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                  <span className="break-words">{change.before}</span>
                  <ArrowRight className="rotate-90 text-muted sm:rotate-0" size={14} aria-hidden="true" />
                  <span className="break-words text-ink">{change.after}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <time className="mt-3 block text-xs text-muted" dateTime={activity.createdAt}>{formatActivityTime(activity.createdAt)}</time>
      </div>
    </article>
  );
}

export default function ActivityList({ activities, allCount, loading }) {
  return (
    <Card className="overflow-hidden">
      {loading ? <LoadingState label="載入活動紀錄中…" /> : null}
      {!loading && activities.length ? (
        <div className="divide-y divide-line-soft">
          {activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}
        </div>
      ) : null}
      {!loading && !activities.length ? (
        <EmptyState
          icon={Activity}
          title="沒有符合條件的活動"
          description={allCount ? "請調整或重設篩選條件。" : "Issue 有新的建立、更新、留言或狀態變化時會顯示在這裡。"}
        />
      ) : null}
    </Card>
  );
}
