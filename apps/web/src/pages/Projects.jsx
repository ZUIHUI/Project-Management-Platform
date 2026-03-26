import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../features/project";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [newProject, setNewProject] = useState({ key: "", name: "", description: "" });
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [milestoneName, setMilestoneName] = useState("");
  const [sprintForm, setSprintForm] = useState({ name: "", goal: "" });
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      const response = await projectService.fetchProjects();
      const list = response.data?.data ?? [];
      setProjects(list);
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    } catch {
      setError("無法載入專案");
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
      await projectService.createProject({ ...newProject, ownerId: "user-pm" });
      setNewProject({ key: "", name: "", description: "" });
      await loadProjects();
    } catch {
      setError("新增專案失敗（可能 key 重複）");
    }
  };

  const handleArchive = async (projectId) => {
    try {
      await projectService.archiveProject(projectId);
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
      await projectService.createMilestone(selectedProjectId, { name: milestoneName.trim() });
      setMilestoneName("");
      await loadProjects();
    } catch {
      setError("新增里程碑失敗");
    }
  };

  const handleCreateSprint = async (event) => {
    event.preventDefault();
    if (!selectedProjectId || !sprintForm.name.trim()) {
      return;
    }

    try {
      await projectService.createSprint(selectedProjectId, {
        name: sprintForm.name.trim(),
        goal: sprintForm.goal.trim() || undefined,
      });
      setSprintForm({ name: "", goal: "" });
      await loadProjects();
    } catch {
      setError("新增 Sprint 失敗");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Project Delivery Setup</h1>
        <p className="text-sm text-gray-600">以主流流程管理：Project → Milestone → Sprint → Issues。</p>
      </header>

      {error ? <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p> : null}

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">建立新專案（產品線/服務）</h2>
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

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-lg border bg-white p-4 shadow-sm xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">專案清單</h2>
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
                className={`rounded border px-3 py-2 ${selectedProjectId === project.id ? "border-blue-500 bg-blue-50" : ""}`}
              >
                <button type="button" className="w-full text-left" onClick={() => setSelectedProjectId(project.id)}>
                  <div className="font-medium">
                    {project.key} - {project.name}
                  </div>
                  <div className="text-xs text-gray-500">狀態：{project.status}</div>
                </button>
                <button type="button" className="mt-2 rounded border px-2 py-1 text-xs" onClick={() => handleArchive(project.id)}>
                  封存
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border bg-white p-4 shadow-sm xl:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Delivery Plan（里程碑 + Sprint）</h2>
          {selectedProject ? (
            <div className="space-y-4 text-sm">
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold">
                  {selectedProject.key} - {selectedProject.name}
                </p>
                <p className="text-gray-600">{selectedProject.description || "尚未填寫描述"}</p>
              </div>


              <div className="flex gap-2">
                <Link to={`/projects/${selectedProject.id}`} className="rounded border px-3 py-1">專案詳情</Link>
                <Link to={`/projects/${selectedProject.id}/issues`} className="rounded border px-3 py-1">Issue List</Link>
                <Link to={`/projects/${selectedProject.id}/board`} className="rounded border px-3 py-1">Board</Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form className="space-y-2 rounded border p-3" onSubmit={handleCreateMilestone}>
                  <h3 className="font-semibold">Milestone（版本/交付節點）</h3>
                  <input
                    className="w-full rounded border px-2 py-1"
                    placeholder="例如：MVP Beta"
                    value={milestoneName}
                    onChange={(event) => setMilestoneName(event.target.value)}
                  />
                  <button className="rounded border px-3 py-1" type="submit">
                    新增 Milestone
                  </button>
                  <p className="text-xs text-gray-500">目前數量：{selectedProject.milestones?.length ?? 0}</p>
                </form>

                <form className="space-y-2 rounded border p-3" onSubmit={handleCreateSprint}>
                  <h3 className="font-semibold">Sprint（迭代）</h3>
                  <input
                    className="w-full rounded border px-2 py-1"
                    placeholder="例如：Sprint 1"
                    value={sprintForm.name}
                    onChange={(event) => setSprintForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <input
                    className="w-full rounded border px-2 py-1"
                    placeholder="Sprint Goal（可選）"
                    value={sprintForm.goal}
                    onChange={(event) => setSprintForm((prev) => ({ ...prev, goal: event.target.value }))}
                  />
                  <button className="rounded border px-3 py-1" type="submit">
                    新增 Sprint
                  </button>
                  <p className="text-xs text-gray-500">目前數量：{selectedProject.sprints?.length ?? 0}</p>
                </form>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">請選擇專案</p>
          )}
        </article>
      </section>
    </div>
  );
}
