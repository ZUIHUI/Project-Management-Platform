import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Onboarding from "../Onboarding";

export default function MainLayout({ onLogout, currentUser }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar onLogout={onLogout} currentUser={currentUser} />
      <main className="flex-1 px-6 py-6 md:px-8">
        <header className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">目前登入</p>
          <p className="font-semibold text-slate-900">
            {currentUser?.name || "未命名使用者"}
            <span className="ml-2 text-sm font-normal text-slate-500">{currentUser?.email || "-"}</span>
          </p>
        </header>
        <Onboarding />
        <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
