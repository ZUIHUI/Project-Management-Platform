import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RequireAuth from "./components/auth/RequireAuth";
import GuestOnly from "./components/auth/GuestOnly";
import { WORKSPACE_ROLE_REQUIREMENTS } from "./components/layout/workspaceAccess.js";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDashboard = lazy(() => import("./pages/ProjectDashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const BoardPage = lazy(() => import("./pages/BoardPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const InsightsPageWrapper = lazy(() => import("./pages/InsightsPageWrapper"));
const WorkloadPage = lazy(() => import("./pages/WorkloadPage"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const ActivityLogView = lazy(() => import("./pages/ActivityLogView"));
const SprintManagement = lazy(() => import("./pages/SprintManagement"));
const MilestoneManagement = lazy(() => import("./pages/MilestoneManagement"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/home" replace />} />
          {/* Home and Main Navigation */}
          <Route path="home" element={<Home />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.dashboard}><Dashboard /></RequireAuth>} />
          
          {/* Global Views */}
          <Route path="board" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.board}><BoardPage /></RequireAuth>} />
          <Route path="calendar" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.calendar}><CalendarPage /></RequireAuth>} />
          <Route path="timeline" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.timeline}><TimelinePage /></RequireAuth>} />
          <Route path="insights" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.insights}><InsightsPageWrapper /></RequireAuth>} />
          <Route path="workload" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.workload}><WorkloadPage /></RequireAuth>} />
          
          {/* Team and Activity Management */}
          <Route path="team" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.team}><TeamManagement /></RequireAuth>} />
          <Route path="activity" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.activity}><ActivityLogView /></RequireAuth>} />
          
          {/* Projects */}
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectDashboard />} />
          
          {/* Project-Specific Views */}
          <Route path="projects/:projectId/issues" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.projectIssues}><Tasks viewMode="list" /></RequireAuth>} />
          <Route path="projects/:projectId/board" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.projectBoard}><Tasks viewMode="board" /></RequireAuth>} />
          <Route path="projects/:projectId/sprint" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.projectSprint}><SprintManagement /></RequireAuth>} />
          <Route path="projects/:projectId/milestone" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.projectMilestone}><MilestoneManagement /></RequireAuth>} />
          
          {/* Other Pages */}
          <Route path="notifications" element={<RequireAuth minRole={WORKSPACE_ROLE_REQUIREMENTS.notifications}><Notifications /></RequireAuth>} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
