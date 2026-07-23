import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, EmptyState, LoadingState } from "../../../components/ui";
import { cn } from "../../../components/ui/styles";
import { formatNotificationTime, presentNotification } from "../notificationPresentation";

export default function NotificationList({ notifications, loading, filter, readingIds, onMarkRead }) {
  return (
    <Card className="overflow-hidden">
      {loading ? <LoadingState label="載入通知中…" /> : null}
      {!loading && notifications.length ? (
        <div className="divide-y divide-line-soft">
          {notifications.map((notification) => {
            const presentation = presentNotification(notification);
            const reading = readingIds.includes(notification.id);
            return (
              <article key={notification.id} aria-busy={reading || undefined} className={cn("flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6", !notification.read && "bg-brand-soft")}>
                <div className="flex min-w-0 gap-4">
                  <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full", notification.read ? "bg-surface-strong text-body" : "bg-brand text-white")}>
                    <Bell size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={notification.read ? "neutral" : "brand"}>{presentation.label}</Badge>
                      {!notification.read ? <span className="text-xs font-semibold text-brand">未讀</span> : null}
                    </div>
                    <h2 className="mt-2 text-sm font-semibold leading-6 text-ink">{presentation.title}</h2>
                    {presentation.detail ? <p className="mt-1 break-words text-xs leading-5 text-muted">{presentation.detail}</p> : null}
                    <time className="mt-1 block text-xs text-muted" dateTime={notification.createdAt}>{formatNotificationTime(notification.createdAt)}</time>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
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
                  {notification.read ? (
                    <Badge className="self-start sm:self-center"><Check size={14} aria-hidden="true" />已讀</Badge>
                  ) : (
                    <Button className="w-full sm:w-auto" variant="secondary" size="sm" disabled={reading} onClick={() => onMarkRead(notification.id)}>
                      <CheckCheck size={16} aria-hidden="true" />{reading ? "更新中…" : "標示已讀"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
      {!loading && !notifications.length ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "沒有未讀通知" : "目前沒有通知"}
          description={filter === "unread" ? "所有消息都已處理完成。" : "新的指派、提及、專案更新與自用提醒會出現在這裡。"}
        />
      ) : null}
    </Card>
  );
}
