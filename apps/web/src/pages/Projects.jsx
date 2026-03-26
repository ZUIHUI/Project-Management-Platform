import { useEffect, useMemo, useState } from "react";
import {
  archiveProject,
  createMilestone,
  createProject,
  createSprint,
  fetchProjects,
} from "../services/projects";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [newProject, setNewProject] = useState({ key: "", name: "", description: "" });
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [milestoneName, setMilestoneName] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      const response = await fetchProjects();
      const list = response.data?.data ?? [];
      setProjects(list);
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    } catch {
      setError("無法載入專案");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filtered = useMemo(
    () => projects.filter((project) => project.name.toLowerCase().includes(keyword.toLowerCase())),
    [projects, keyword],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!newProject.key || !newProject.name) {
      return;
    }

    try {
      await createProject({ ...newProject, ownerId: "user-pm" });
      setNewProject({ key: "", name: "", description: "" });
      await loadProjects();
    } catch {
      setError("新增專案失敗（可能 key 重複）");
    }
  };

  const handleArchive = async (projectId) => {
    try {
      await archiveProject(projectId);
      await loadProjects();
    } catch {
      setError("封存失敗");
    }
  };

  const handleCreateMilestone = async (event) => {
    event.preventDefault();
    if (!selectedProjectId || !milestoneName.trim()) {
      return;
    }

    try {
      await createMilestone(selectedProjectId, { name: milestoneName.trim() });
      setMilestoneName("");
      await loadProjects();
    } catch {
      setError("新增里程碑失敗");
    }
  };

  const handleCreateSprint = async (event) => {
    event.preventDefault();
    if (!selectedProjectId || !sprintName.trim()) {
      return;
    }

    try {
      await createSprint(selectedProjectId, { name: sprintName.trim() });
      setSprintName("");
      await loadProjects();
    } catch {
      setError("新增 Sprint 失敗");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Projects（嚴格重構版）</h1>
        <p className="text-sm text-gray-600">支援 Project、Milestone、Sprint 的規格化資料流。</p>
      </header>

      {error ? <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p> : null}

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <form className="grid gap-2 md:grid-cols-4" onSubmit={handleCreateProject}>
          <input
            className="rounded border px-3 py-2"
            placeholder="Project Key"
            value={newProject.key}
            onChange={(event) => setNewProject((prev) => ({ ...prev, key: event.target.value.toUpperCase() }))}
          />
          <input
            className="rounded border px-3 py-2"
            placeholder="Project Name"
            value={newProject.name}
            onChange={(event) => setNewProject((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="rounded border px-3 py-2"
            placeholder="Description"
            value={newProject.description}
            onChange={(event) => setNewProject((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button className="rounded bg-blue-600 px-3 py-2 text-white" type="submit">
            新增專案
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">專案列表</h2>
            <input
              className="rounded border px-2 py-1 text-sm"
              placeholder="搜尋"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <ul className="space-y-2">
            {filtered.map((project) => (
              <li
                key={project.id}
                className={`rounded border px-3 py-2 ${
                  selectedProjectId === project.id ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="font-medium">
                    {project.key} - {project.name}
                  </div>
                  <div className="text-xs text-gray-500">狀態：{project.status}</div>
                </button>
                <button
                  type="button"
                  className="mt-2 rounded border px-2 py-1 text-xs"
                  onClick={() => handleArchive(project.id)}
                >
                  封存
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">專案詳情</h2>
          {selectedProject ? (
            <div className="space-y-3 text-sm">
              <p>
                <strong>{selectedProject.name}</strong>
              </p>
              <p>{selectedProject.description}</p>
              <p>Members: {selectedProject.members?.length ?? 0}</p>
              <p>Milestones: {selectedProject.milestones?.length ?? 0}</p>
              <p>Sprints: {selectedProject.sprints?.length ?? 0}</p>

              <form className="flex gap-2" onSubmit={handleCreateMilestone}>
                <input
                  className="flex-1 rounded border px-2 py-1"
                  placeholder="新增 Milestone"
                  value={milestoneName}
                  onChange={(event) => setMilestoneName(event.target.value)}
                />
                <button className="rounded border px-3 py-1" type="submit">
                  新增
                </button>
              </form>

              <form className="flex gap-2" onSubmit={handleCreateSprint}>
                <input
                  className="flex-1 rounded border px-2 py-1"
                  placeholder="新增 Sprint"
                  value={sprintName}
                  onChange={(event) => setSprintName(event.target.value)}
                />
                <button className="rounded border px-3 py-1" type="submit">
                  新增
                </button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-gray-500">請選擇專案</p>
          )}
        </article>
      </section>
    </div>
  );
}
