import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const handleAuthSuccess = () => {
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
