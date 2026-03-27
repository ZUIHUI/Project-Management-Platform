import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { icons } from "../icons";
import { authService } from "../../features/auth/authService";

const navItems = [
  { name: "Home", path: "/home", icon: "dashboard", minRole: "viewer" },
  { name: "Projects", path: "/projects", icon: "project", minRole: "viewer" },
  { name: "Dashboard", path: "/dashboard", icon: "dashboard", minRole: "member" },
  { name: "Notifications", path: "/notifications", icon: "task", minRole: "member" },
  { name: "Settings", path: "/settings", icon: "project", minRole: "viewer" },
];

const ProjectIcon = icons.sidebartitle;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const currentUser = authService.getCurrentUser();
  const visibleItems = navItems.filter((item) => authService.hasRole(item.minRole));

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <aside
      className={`relative flex min-h-screen flex-col border-r border-slate-200 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl transition-all duration-300 ${collapsed ? "w-16 px-2" : "w-64 px-4"} py-6`}
      style={{ zIndex: 20 }}
    >
      <div className={`mb-10 flex items-center transition-all duration-300 ${collapsed ? "justify-center" : ""}`}>
        {!collapsed ? (
          <div className="ml-2 flex flex-1 items-center space-x-2">
            {ProjectIcon && (
              <span className="rounded-full bg-blue-100 p-1">
                <ProjectIcon size={20} className="text-blue-700" />
              </span>
            )}
            <span className="text-2xl font-bold tracking-wide">Workspace</span>
          </div>
        ) : null}
        <button
          className="ml-2 flex h-8 w-8 items-center justify-center border-0 bg-transparent text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "展開選單" : "收合選單"}
        >
          <span className="text-lg font-bold">{collapsed ? "»" : "«"}</span>
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {visibleItems.map((item) => {
          const ItemIcon = icons[item.icon];
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                active ? "bg-white text-blue-700 shadow" : "hover:bg-blue-600"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={item.name}
            >
              {ItemIcon && (
                <ItemIcon
                  size={20}
                  className={`transition ${active ? "text-blue-700" : "text-blue-100 group-hover:text-white"}`}
                />
              )}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="space-y-2 border-t border-blue-500/40 pt-4">
          {currentUser ? (
            <div className="rounded border border-blue-300/30 px-3 py-2 text-xs text-blue-100">
              <div className="font-semibold">{currentUser.name}</div>
              <div className="opacity-80">{currentUser.role}</div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-lg border border-blue-300/30 px-3 py-2 text-left text-sm text-blue-100 transition hover:bg-blue-700"
          >
            登出
          </button>
          <Link
            to="/register"
            className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            建立新帳號
          </Link>
        </div>
      ) : null}

      <div className={`mt-auto pt-6 ${collapsed ? "text-center text-xs text-blue-200" : "text-sm text-blue-100"}`}>
        {!collapsed ? (
          <div>
            <div>© 2026 Project App</div>
            <div className="opacity-70">v1.1.0</div>
          </div>
        ) : (
          <span>©</span>
        )}
      </div>
    </aside>
  );
}
