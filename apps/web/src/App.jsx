import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Home from "./pages/Home";
import RequireAuth from "./components/auth/RequireAuth";
import Timeline from "./pages/Timeline";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainLayout />}>
          <Route
            index
            element={
              <RequireAuth>
                <Navigate to="/home" replace />
              </RequireAuth>
            }
          />
          <Route path="home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="dashboard" element={<RequireAuth minRole="member"><Dashboard /></RequireAuth>} />
          <Route path="projects" element={<RequireAuth><Projects /></RequireAuth>} />
          <Route path="projects/:projectId" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
          <Route path="projects/:projectId/issues" element={<RequireAuth><Tasks viewMode="list" /></RequireAuth>} />
          <Route path="projects/:projectId/board" element={<RequireAuth><Tasks viewMode="board" /></RequireAuth>} />
          <Route path="projects/:projectId/timeline" element={<RequireAuth><Timeline /></RequireAuth>} />
          <Route path="notifications" element={<RequireAuth minRole="member"><Notifications /></RequireAuth>} />
          <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  );
}
