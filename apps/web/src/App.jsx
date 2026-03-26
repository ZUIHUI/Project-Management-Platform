import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

const STORAGE_KEY = "pmp-authenticated";
const USER_STORAGE_KEY = "pmp-current-user";

const isAuthenticated = () => localStorage.getItem(STORAGE_KEY) === "true";

const getCurrentUser = () => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

function ProtectedLayout({ onLogout }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout onLogout={onLogout} currentUser={getCurrentUser()} />;
}

function PublicOnly({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const handleAuthSuccess = (user) => {
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
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
