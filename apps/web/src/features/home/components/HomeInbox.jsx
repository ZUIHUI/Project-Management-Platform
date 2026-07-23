import { ArrowRight, Bell, CheckCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, CardHeader, EmptyState } from "../../../components/ui";
import { cn } from "../../../components/ui/styles";
import { formatNotificationTime, presentNotification } from "../../notification/notificationPresentation";

export default function HomeInbox({ notifications, readingIds, onMarkRead }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="收件匣"
        description="最近的指派、提及與工作狀態更新。"
        action={(
          <Link
            to="/notifications"
            className="inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-sm font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            查看全部<ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      />

      {notifications.length ? (
        <div className="divide-y divide-line-soft" aria-live="polite">
          {notifications.map((notification) => {
            const presentation = presentNotification(notification);
            const reading = readingIds.includes(notification.id);
            return <article key={notification.id} aria-busy={reading || undefined} className={cn("px-5 py-4 sm:px-6", !notification.read && "bg-brand-soft")}>
              <div className="flex items-start gap-3">
                <span className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  notification.read ? "bg-surface-strong text-body" : "bg-brand text-white",
                )}>
                  <Bell size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={notification.read ? "neutral" : "brand"}>{presentation.label}</Badge>
                    {!notification.read ? <span className="text-xs font-semibold text-brand">未讀</span> : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-ink">{presentation.title}</p>
                  {presentation.detail ? <p className="mt-1 break-words text-xs leading-5 text-muted">{presentation.detail}</p> : null}
                  <p className="mt-1 text-xs text-muted">{formatNotificationTime(notification.createdAt)}</p>
                </div>
              </div>

              {presentation.issueHref || !notification.read ? (
                <div className="mt-3 flex flex-col justify-end gap-2 sm:flex-row">
                  {presentation.issueHref ? (
                    <Button
                      as={Link}
                      to={presentation.issueHref}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => { if (!notification.read && !reading) void onMarkRead(notification.id); }}
                    >
                      查看 Issue<ExternalLink size={15} aria-hidden="true" />
                    </Button>
                  ) : null}
                  {!notification.read ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={reading}
                    onClick={() => onMarkRead(notification.id)}
                  >
                    <CheckCheck size={16} aria-hidden="true" />
                    {reading ? "更新中…" : "標示已讀"}
                  </Button>
                  ) : null}
                </div>
              ) : null}
            </article>;
          })}
        </div>
      ) : (
        <EmptyState compact icon={Bell} title="目前沒有通知" description="新的指派、提及或狀態更新會出現在這裡。" />
      )}
    </Card>
  );
}
