import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Columns3,
  FolderKanban,
  Gauge,
  GanttChartSquare,
  History,
  House,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../features/auth/authService";
import { useCurrentUser } from "../../features/auth/useCurrentUser";
import {
  getPlatformRoleLabel,
  PRODUCT_MARK,
  PRODUCT_SHORT_NAME,
} from "../../shared/productPresentation.js";
import { IconButton } from "../ui";
import { cn } from "../ui/styles";
import { WORKSPACE_ROLE_REQUIREMENTS } from "./workspaceAccess.js";

const navSections = [
  {
    id: "workspace",
    label: "工作區",
    items: [
      { name: "總覽", path: "/home", icon: House, minRole: WORKSPACE_ROLE_REQUIREMENTS.home, exact: true },
      { name: "專案", path: "/projects", icon: FolderKanban, minRole: WORKSPACE_ROLE_REQUIREMENTS.projects },
      { name: "營運儀表板", path: "/dashboard", icon: Gauge, minRole: WORKSPACE_ROLE_REQUIREMENTS.dashboard, exact: true },
    ],
  },
  {
    id: "planning",
    label: "規劃與交付",
    items: [
      { name: "看板", path: "/board", icon: Columns3, minRole: WORKSPACE_ROLE_REQUIREMENTS.board, exact: true },
      { name: "時間軸", path: "/timeline", icon: GanttChartSquare, minRole: WORKSPACE_ROLE_REQUIREMENTS.timeline, exact: true },
      { name: "行事曆", path: "/calendar", icon: CalendarDays, minRole: WORKSPACE_ROLE_REQUIREMENTS.calendar, exact: true },
    ],
  },
  {
    id: "insights",
    label: "洞察與治理",
    items: [
      { name: "分析", path: "/insights", icon: ChartNoAxesCombined, minRole: WORKSPACE_ROLE_REQUIREMENTS.insights, exact: true },
      { name: "工作負載", path: "/workload", icon: Activity, minRole: WORKSPACE_ROLE_REQUIREMENTS.workload, exact: true },
      { name: "團隊", path: "/team", icon: Users, minRole: WORKSPACE_ROLE_REQUIREMENTS.team, exact: true },
      { name: "活動紀錄", path: "/activity", icon: History, minRole: WORKSPACE_ROLE_REQUIREMENTS.activity, exact: true },
    ],
  },
];

const accountItems = [
  { name: "通知", path: "/notifications", icon: Bell, minRole: WORKSPACE_ROLE_REQUIREMENTS.notifications, exact: true },
  { name: "設定", path: "/settings", icon: Settings, minRole: WORKSPACE_ROLE_REQUIREMENTS.settings, exact: true },
];

const isActivePath = (pathname, item) =>
  item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const currentUser = useCurrentUser();
  const sidebarRef = useRef(null);

  useEffect(() => {
    onMobileClose();
  }, [location.pathname, onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const sidebar = sidebarRef.current;
    const previousFocus = document.activeElement;
    const focusableSelector = 'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = () => [...(sidebar?.querySelectorAll(focusableSelector) ?? [])].filter((element) => element.getClientRects().length > 0);
    sidebar?.querySelector("[data-mobile-close]")?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onMobileClose();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [mobileOpen, onMobileClose]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const renderItem = (item) => {
    if (!authService.hasRole(item.minRole)) return null;
    const active = isActivePath(location.pathname, item);
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.name : undefined}
        className={cn(
          "group relative flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          active ? "bg-brand-soft text-brand-active" : "text-body hover:bg-surface-strong hover:text-ink",
          collapsed && "lg:justify-center lg:px-0",
        )}
      >
        <Icon size={19} strokeWidth={active ? 2.25 : 1.8} aria-hidden="true" />
        <span className={cn(collapsed && "lg:sr-only")}>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="關閉導覽選單"
          className="fixed inset-0 z-40 bg-[rgba(10,11,13,0.5)] lg:hidden"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        id="primary-navigation"
        ref={sidebarRef}
        aria-label="主要導覽"
        aria-modal={mobileOpen ? "true" : undefined}
        role={mobileOpen ? "dialog" : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] flex-col border-r border-line bg-canvas transition-transform duration-200",
          mobileOpen ? "flex" : "hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:flex lg:h-screen lg:translate-x-0 lg:transition-[width]",
          collapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line-soft px-4">
          <Link to="/home" className={cn("flex min-h-11 min-w-0 items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", collapsed && "lg:justify-center")}>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">{PRODUCT_MARK}</span>
            <span className={cn("truncate font-display text-lg font-medium tracking-tight text-ink", collapsed && "lg:sr-only")}>{PRODUCT_SHORT_NAME}</span>
          </Link>
          <IconButton label="關閉導覽選單" data-mobile-close className="lg:hidden" onClick={onMobileClose}>
            <X size={20} aria-hidden="true" />
          </IconButton>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {navSections.map((section) => (
              <section key={section.id} aria-labelledby={`nav-${section.id}`}>
                <h2 id={`nav-${section.id}`} className={cn("mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-muted", collapsed && "lg:sr-only")}>
                  {section.label}
                </h2>
                <div className="space-y-1">{section.items.map(renderItem)}</div>
              </section>
            ))}

            <section aria-labelledby="nav-account">
              <h2 id="nav-account" className={cn("mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-muted", collapsed && "lg:sr-only")}>帳號與通知</h2>
              <div className="space-y-1">{accountItems.map(renderItem)}</div>
            </section>
          </div>
        </nav>

        <div className="border-t border-line-soft p-3">
          {currentUser ? (
            <div className={cn("mb-2 flex items-center gap-3 rounded-control px-3 py-2", collapsed && "lg:justify-center lg:px-0")}>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-sm font-semibold text-ink">
                {(currentUser.name || "U").slice(0, 1).toUpperCase()}
              </span>
              <div className={cn("min-w-0", collapsed && "lg:sr-only")}>
                <p className="truncate text-sm font-semibold text-ink">{currentUser.name}</p>
                <p className="truncate text-xs text-muted">{getPlatformRoleLabel(currentUser.role)}</p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-sm font-medium text-body transition-colors hover:bg-surface-strong hover:text-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
              collapsed && "lg:justify-center lg:px-0",
            )}
            title={collapsed ? "登出" : undefined}
          >
            <LogOut size={19} aria-hidden="true" />
            <span className={cn(collapsed && "lg:sr-only")}>登出</span>
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="mt-2 hidden min-h-11 w-full items-center justify-center gap-2 rounded-control text-xs font-medium text-muted transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:flex"
            aria-label={collapsed ? "展開側邊欄" : "收合側邊欄"}
          >
            {collapsed ? <ChevronRight size={18} aria-hidden="true" /> : <ChevronLeft size={18} aria-hidden="true" />}
            {!collapsed ? <span>收合選單</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
