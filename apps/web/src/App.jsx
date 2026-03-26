import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import MainLayout from "./components/layout/MainLayout";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
