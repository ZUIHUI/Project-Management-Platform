import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Alert, Badge, Button, PageHeader } from "../components/ui";
import { cn } from "../components/ui/styles";
import NotificationComposerDialog from "../features/notification/components/NotificationComposerDialog";
import NotificationList from "../features/notification/components/NotificationList";
import { useNotificationsWorkspace } from "../features/notification/useNotificationsWorkspace";

const filters = [
  { value: "all", label: "全部" },
  { value: "unread", label: "未讀" },
];

export default function Notifications() {
  const workspace = useNotificationsWorkspace();
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="個人收件匣"
        title="通知"
        description="集中處理指派、提及、專案狀態更新與自己的待辦提醒。"
        actions={
          <>
            <Button variant="secondary" onClick={workspace.refresh} disabled={workspace.loading || workspace.refreshing}>
              <RefreshCw className={workspace.refreshing ? "animate-spin motion-reduce:animate-none" : ""} size={17} aria-hidden="true" />
              {workspace.refreshing ? "整理中…" : "重新整理"}
            </Button>
            <Button onClick={() => setComposerOpen(true)}><Plus size={17} aria-hidden="true" />建立提醒</Button>
          </>
        }
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone={workspace.unreadCount ? "brand" : "neutral"}>{workspace.unreadCount} 則未讀</Badge>
          <Badge>{workspace.notifications.length} 則全部</Badge>
        </div>
      </PageHeader>

      <div aria-live="polite" className="space-y-3">
        {workspace.error ? <Alert tone="error" title="通知未完整更新">{workspace.error}</Alert> : null}
        {workspace.notice ? <Alert tone="success">{workspace.notice}</Alert> : null}
      </div>

      <div className="flex w-full rounded-pill bg-surface-strong p-1 sm:w-fit" role="group" aria-label="通知篩選">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={workspace.filter === item.value}
            onClick={() => workspace.setFilter(item.value)}
            className={cn(
              "min-h-11 flex-1 rounded-pill px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:flex-none",
              workspace.filter === item.value ? "bg-canvas text-ink shadow-soft" : "text-body hover:text-ink",
            )}
          >
            {item.label}{item.value === "unread" ? ` ${workspace.unreadCount}` : ""}
          </button>
        ))}
      </div>

      <NotificationList
        notifications={workspace.visibleNotifications}
        loading={workspace.loading}
        filter={workspace.filter}
        readingIds={workspace.readingIds}
        onMarkRead={workspace.markRead}
      />

      <NotificationComposerDialog
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreate={workspace.createReminder}
        saving={workspace.createSaving}
        error={workspace.createError}
        onClearError={workspace.clearCreateError}
      />
    </div>
  );
}
