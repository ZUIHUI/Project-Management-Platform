import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

const STORAGE_KEY = "pmp-authenticated";

const isAuthenticated = () => localStorage.getItem(STORAGE_KEY) === "true";

function ProtectedLayout({ onLogout }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout onLogout={onLogout} />;
}

function PublicOnly({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

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
        <Route
          path="/login"
          element={(
            <PublicOnly>
              <Login onLoginSuccess={handleAuthSuccess} />
            </PublicOnly>
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicOnly>
              <Register onRegisterSuccess={handleAuthSuccess} />
            </PublicOnly>
          )}
        />
        <Route path="/" element={<ProtectedLayout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
