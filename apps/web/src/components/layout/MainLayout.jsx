import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Onboarding from "../Onboarding";

export default function MainLayout({ onLogout }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 px-6 py-6 md:px-8">
        <Onboarding />
        <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
