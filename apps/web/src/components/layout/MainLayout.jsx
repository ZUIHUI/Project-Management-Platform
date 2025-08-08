import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex w-full h-max min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-white px-8 py-6">
        <div className="flex gap-8 h-full">
          <div className="flex-1 min-w-[350px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
