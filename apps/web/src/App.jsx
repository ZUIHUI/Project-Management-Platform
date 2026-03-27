import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Home from "./pages/Home";
import RequireAuth from "./components/auth/RequireAuth";
import Tasks from "./pages/Tasks";
import MilestoneManagement from "./components/MilestoneManagement";
import TagsManagement from "./components/TagsManagement";
import SprintManagement from "./pages/SprintManagement";
import TeamManagement from "./pages/TeamManagement";
import ActivityLogView from "./pages/ActivityLogView";
import InsightsPage from "./pages/InsightsPage";
import ProjectDashboard from "./pages/ProjectDashboard";
import BoardPage from "./pages/BoardPage";
import CalendarPage from "./pages/CalendarPage";
import TimelinePage from "./pages/TimelinePage";
import WorkloadPage from "./pages/WorkloadPage";

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
          {/* Home and Main Navigation */}
          <Route path="home" element={<RequireAuth><Home /></RequireAuth>} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<RequireAuth minRole="member"><Dashboard /></RequireAuth>} />
          
          {/* Global Views */}
          <Route path="board" element={<RequireAuth minRole="member"><BoardPage /></RequireAuth>} />
          <Route path="calendar" element={<RequireAuth minRole="member"><CalendarPage /></RequireAuth>} />
          <Route path="timeline" element={<RequireAuth minRole="member"><TimelinePage /></RequireAuth>} />
          <Route path="insights" element={<RequireAuth minRole="member"><InsightsPage /></RequireAuth>} />
          <Route path="workload" element={<RequireAuth minRole="member"><WorkloadPage /></RequireAuth>} />
          
          {/* Team and Activity Management */}
          <Route path="team" element={<RequireAuth minRole="member"><TeamManagement /></RequireAuth>} />
          <Route path="activity" element={<RequireAuth minRole="member"><ActivityLogView /></RequireAuth>} />
          <Route path="tags" element={<RequireAuth minRole="member"><TagsManagement /></RequireAuth>} />
          
          {/* Projects */}
          <Route path="projects" element={<RequireAuth><Projects /></RequireAuth>} />
          <Route path="projects/:projectId" element={<RequireAuth><ProjectDashboard /></RequireAuth>} />
          
          {/* Project-Specific Views */}
          <Route path="projects/:projectId/issues" element={<RequireAuth><Tasks viewMode="list" /></RequireAuth>} />
          <Route path="projects/:projectId/board" element={<RequireAuth><Tasks viewMode="board" /></RequireAuth>} />
          <Route path="projects/:projectId/sprint" element={<RequireAuth minRole="member"><SprintManagement /></RequireAuth>} />
          <Route path="projects/:projectId/milestone" element={<RequireAuth minRole="member"><MilestoneManagement /></RequireAuth>} />
          
          {/* Other Pages */}
          <Route path="notifications" element={<RequireAuth minRole="member"><Notifications /></RequireAuth>} />
          <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  );
}
