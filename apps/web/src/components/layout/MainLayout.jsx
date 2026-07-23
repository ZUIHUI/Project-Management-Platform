import { Suspense, useCallback, useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getWorkspaceDocumentTitle, getWorkspaceRouteLabel } from "./workspaceRoutePresentation";
import { IconButton, LoadingState } from "../ui";
import { authService } from "../../features/auth/authService";
import { PRODUCT_SHORT_NAME } from "../../shared/productPresentation.js";

export default function MainLayout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const canViewNotifications = authService.hasRole("member");
  const routeLabel = getWorkspaceRouteLabel(location.pathname);

  useEffect(() => {
    document.title = getWorkspaceDocumentTitle(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <a className="skip-link" href="#main-content">
        跳到主要內容
      </a>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        已開啟{routeLabel}頁面
      </div>

      <div className="flex min-h-screen w-full">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />

        <div className="min-w-0 flex-1" inert={mobileNavOpen ? true : undefined} aria-hidden={mobileNavOpen ? "true" : undefined}>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas px-4 lg:hidden">
            <div className="flex items-center gap-2">
              <IconButton label="開啟導覽選單" aria-expanded={mobileNavOpen} aria-controls="primary-navigation" onClick={() => setMobileNavOpen(true)}>
                <Menu size={21} aria-hidden="true" />
              </IconButton>
              <Link to="/home" className="inline-flex min-h-11 items-center rounded-control px-2 font-display text-lg font-medium tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                {PRODUCT_SHORT_NAME}
              </Link>
            </div>
            {canViewNotifications ? <Link
              to="/notifications"
              aria-label="查看通知"
              title="查看通知"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-body transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Bell size={20} aria-hidden="true" />
            </Link> : null}
          </header>

          <main id="main-content" tabIndex="-1" className="mx-auto w-full max-w-content px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8 xl:px-10">
            <Suspense fallback={<LoadingState label="載入頁面…" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
