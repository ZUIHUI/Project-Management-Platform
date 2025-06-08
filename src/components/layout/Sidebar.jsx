import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { icons } from "../icons";

// sidebar list
const navItems = [
  { name: "資訊儀錶板", path: "/", icon: "dashboard" },
  { name: "專案設定", path: "/projects", icon: "project" },
  { name: "專案任務", path: "/tasks", icon: "task" },
];

const ProjectIcon = icons["sidebartitle"];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        transition-all duration-300 bg-blue-700 text-white min-h-screen relative
        flex flex-col
        ${collapsed ? "w-16 px-2" : "w-60 px-4"}
        py-6 shadow-xl
      `}
      style={{
        boxShadow: "2px 0 16px 0 rgba(30, 64, 175, 0.08)",
        zIndex: 20,
      }}
    >
      {/* Header 區塊 */}
      <div
        className={`flex items-center mb-10 transition-all duration-300 ${collapsed ? "justify-center" : ""
          }`}
      >
        {!collapsed ? (
          <div className="flex items-center space-x-2 ml-2 flex-1">
            {ProjectIcon && (
              <span className="bg-blue-100 rounded-full p-1">
                <ProjectIcon size={20} className="text-blue-700" />
              </span>
            )}
            <span className="text-2xl font-bold tracking-wide">專案管理</span>
          </div>
        ) : null}
        <button
          className="bg-transparent text-white border-0 hover:bg-blue-600 transition w-8 h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 ml-2"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "展開選單" : "收合選單"}
        >
          <span className="text-lg font-bold">{collapsed ? "»" : "«"}</span>
        </button>
      </div>
      {/* 導覽選單 */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const ItemIcon = icons[item.icon];
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${active
                  ? "bg-white text-blue-700 font-semibold shadow"
                  : "hover:bg-blue-600"
                }
                ${collapsed ? "justify-center px-0" : ""}
                group
              `}
              title={item.name}
            >
              {ItemIcon && (
                <ItemIcon
                  size={20}
                  className={`transition ${active
                    ? "text-blue-700"
                    : "text-blue-100 group-hover:text-white"
                    }`}
                />
              )}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      {/* 底部資訊（可選） */}
      <div
        className={`mt-auto pt-8 ${collapsed
          ? "text-xs text-blue-200 text-center"
          : "text-sm text-blue-100"
          }`}
      >
        {!collapsed && (
          <div>
            <div>© 2025 Project App</div>
            <div className="opacity-60">v1.0.0</div>
          </div>
        )}
        {collapsed && <span>©</span>}
      </div>
    </aside>
  );
}
