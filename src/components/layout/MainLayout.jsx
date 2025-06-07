import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";;


export default function MainLayout() {
  return (
    <div className="flex h-max min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-white px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
