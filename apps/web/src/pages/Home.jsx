import { Bell, Columns3, FolderKanban, Gauge, ListChecks, RefreshCw, Settings, TriangleAlert } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Onboarding from "../components/Onboarding";
import { Alert, Badge, Button, Card, LoadingState, PageHeader, StatCard } from "../components/ui";
import HomeInbox from "../features/home/components/HomeInbox";
import HomeIssueList from "../features/home/components/HomeIssueList";
import HomeQuickLinks from "../features/home/components/HomeQuickLinks";
import { useHomeWorkspace } from "../features/home/useHomeWorkspace";
import { authService } from "../features/auth/authService";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { WORKSPACE_ROLE_REQUIREMENTS } from "../components/layout/workspaceAccess.js";

const quickLinks = [
  { title: "專案", description: "查看專案、里程碑與 Sprint", path: "/projects", icon: FolderKanban, minRole: WORKSPACE_ROLE_REQUIREMENTS.projects },
  { title: "工作看板", description: "依狀態查看 Issue；具權限時可推進流程", path: "/board", icon: Columns3, minRole: WORKSPACE_ROLE_REQUIREMENTS.board },
  { title: "營運儀表板", description: "檢查進度、負載與交付風險", path: "/dashboard", icon: Gauge, minRole: WORKSPACE_ROLE_REQUIREMENTS.dashboard },
  { title: "通知", description: "處理指派、提及與提醒", path: "/notifications", icon: Bell, minRole: WORKSPACE_ROLE_REQUIREMENTS.notifications },
  { title: "設定", description: "更新帳號與安全設定", path: "/settings", icon: Settings, minRole: WORKSPACE_ROLE_REQUIREMENTS.settings },
];

const formatRefreshTime = (value) => (
  value ? new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit" }).format(value) : "尚未更新"
);

export default function Home() {
  const user = useCurrentUser();
  const location = useLocation();
  const workspace = useHomeWorkspace(user?.id);
  const canOpenIssues = authService.hasRole(WORKSPACE_ROLE_REQUIREMENTS.projectIssues);
  const visibleQuickLinks = quickLinks.filter((item) => authService.hasRole(item.minRole));
  const projectCount = workspace.dashboard?.totals.projects ?? workspace.projects.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="今日工作中心"
        title={user?.name ? `${user.name}，今天先處理這些工作。` : "今天先處理這些工作。"}
        description="把指派給你的工作、未讀消息與交付風險放在第一屏，減少在不同頁面之間來回尋找。"
        actions={(
          <>
            <Button variant="secondary" onClick={workspace.refresh} disabled={workspace.loading}>
              <RefreshCw size={17} className={workspace.loading ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
              重新整理
            </Button>
            <Button as={Link} to="/projects"><FolderKanban size={17} aria-hidden="true" />查看專案</Button>
          </>
        )}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>更新時間 {formatRefreshTime(workspace.lastUpdatedAt)}</Badge>
          {workspace.unreadCount ? <Badge tone="brand">{workspace.unreadCount} 則未讀</Badge> : null}
        </div>
      </PageHeader>

      {location.state?.denied ? (
        <Alert tone="error" title="權限不足">你的目前角色無法開啟該頁面。若工作內容需要此功能，請聯絡專案管理員調整權限。</Alert>
      ) : null}

      <Onboarding userId={user?.id} />

      <div aria-live="polite" className="space-y-3">
        {workspace.error ? <Alert tone="error" title="今日工作摘要載入失敗">{workspace.error}</Alert> : null}
        {workspace.notice ? <Alert tone="success">{workspace.notice}</Alert> : null}
      </div>

      {workspace.loading ? <Card><LoadingState label="正在整理今日工作…" /></Card> : null}

      {!workspace.loading && workspace.dashboard ? (
        <>
          <section aria-label="今日工作指標" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="指派給我" value={workspace.myIssues.length} helper="尚未完成的工作" icon={ListChecks} />
            <StatCard label="我的逾期" value={workspace.myOverdueCount} helper="需要優先處理" icon={TriangleAlert} tone={workspace.myOverdueCount ? "danger" : "default"} />
            <StatCard label="未讀通知" value={workspace.unreadCount} helper="等待你確認的消息" icon={Bell} />
            <StatCard label="可存取專案" value={projectCount} helper="目前工作範圍" icon={FolderKanban} />
          </section>

          <section aria-label="我的工作與收件匣" className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
            <HomeIssueList
              title="我的工作"
              description="依到期日與優先順序排列，先處理最接近交付期限的 Issue。"
              issues={workspace.myIssues.slice(0, 6)}
              projectById={workspace.projectById}
              canOpenIssues={canOpenIssues}
              emptyTitle="目前沒有指派給你的工作"
              emptyDescription="新的 Issue 指派給你後會出現在這裡。"
              actionHref={canOpenIssues ? "/board" : "/projects"}
              actionLabel={canOpenIssues ? "前往看板" : "查看專案"}
            />
            <HomeInbox
              notifications={workspace.inboxNotifications}
              readingIds={workspace.readingNotificationIds}
              onMarkRead={workspace.markNotificationRead}
            />
          </section>

          <section aria-label="風險與快速入口" className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
            <HomeIssueList
              title="需要關注的交付"
              description="所有可存取專案中，已超過到期日且尚未完成的工作。"
              issues={workspace.riskIssues.slice(0, 5)}
              projectById={workspace.projectById}
              canOpenIssues={canOpenIssues}
              risk
              emptyTitle="目前沒有逾期工作"
              emptyDescription="目前可存取的專案沒有逾期項目。"
              actionHref={canOpenIssues ? "/dashboard" : "/projects"}
              actionLabel={canOpenIssues ? "查看儀表板" : "查看專案"}
            />
            <HomeQuickLinks links={visibleQuickLinks} />
          </section>
        </>
      ) : null}
    </div>
  );
}
