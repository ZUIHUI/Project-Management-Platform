import { Link, useLocation} from "react-router-dom";
import { icons } from "../icons";

// sidebar list
const navItems = [
  { name: "Dashboard",path:"/", icon:"dashboard"},
  { name: "Projects", path: "/projects", icon: "project" },
  { name: "Tasks", path: "/tasks", icon: "task" },
]

const ProjectIcon = icons["sidebartitle"];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 min-h-screen bg-blue-700 text-white px-4 py-6">
      <h2 className="text-2xl font-bold mb-8 flex items-center space-x-2">
        {ProjectIcon && <ProjectIcon size={20} className="mr-2" />}
        <span>專案管理</span>
      </h2>
      <nav className="space-y-4">
        {navItems.map((item) => {
          const ItemIcon = icons[item.icon];
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded hover:bg-blue-600 ${location.pathname === item.path ? "bg-blue-800" : ""
                }`}
            >
              {ItemIcon && <ItemIcon size={18} />}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
