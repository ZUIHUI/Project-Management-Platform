import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProjects } from "../services/projects";
import {
  createIssue,
  fetchIssuesByProject,
  fetchWorkflowStatuses,
  transitionIssueStatus,
} from "../services/task";

const PRIORITY_OPTIONS = ["low", "medium", "high"];

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.error?.message;
  return message || fallback;
};

export default function Tasks({ viewMode = "list" }) {
  const { projectId: routeProjectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(routeProjectId ?? "");
  const [issues, setIssues] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setProjectId(routeProjectId ?? "");
  }, [routeProjectId]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [projectsRes, statusesRes] = await Promise.all([fetchProjects(), fetchWorkflowStatuses()]);

        const projectData = projectsRes.data?.data ?? [];
        setProjects(projectData);

        const workflowStatuses = (statusesRes.data?.data ?? []).sort((a, b) => a.order - b.order);
        setStatuses(workflowStatuses);

        if (!routeProjectId && projectData.length > 0) {
          setProjectId(projectData[0].id);
        }
      } catch (err) {
        setError(getErrorMessage(err, "無法載入初始化資料"));
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [routeProjectId]);

  const loadIssues = useCallback(async (selectedProjectId) => {
    if (!selectedProjectId) {
      setIssues([]);
      return;
    }

    try {
      const response = await fetchIssuesByProject(selectedProjectId, {
        q: keyword || undefined,
        page: 1,
        pageSize: 100,
      });
      const list = response.data?.data ?? [];
      setIssues(list);
      if (list.length > 0) {
        setSelectedIssueId((currentId) => currentId || list[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err, "無法載入 Issue 清單"));
    }
  }, [keyword]);

  useEffect(() => {
    loadIssues(projectId);
  }, [projectId, loadIssues]);

  const selectedProject = useMemo(() => projects.find((project) => project.id === projectId), [projects, projectId]);

  const filteredIssues = useMemo(
    () => issues.filter((issue) => issue.title.toLowerCase().includes(keyword.toLowerCase())),
    [issues, keyword],
  );

  const groupedIssues = useMemo(
    () =>
      statuses.map((status) => ({
        ...status,
        label: status.name,
        items: filteredIssues.filter((issue) => issue.statusId === status.id),
      })),
    [statuses, filteredIssues],
  );

  const statusIndex = useCallback((statusId) => statuses.findIndex((status) => status.id === statusId), [statuses]);

  const selectedIssue = useMemo(() => issues.find((issue) => issue.id === selectedIssueId), [issues, selectedIssueId]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!projectId || !form.title.trim()) {
      return;
    }

    try {
      await createIssue(projectId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        reporterId: "user-pm",
      });
      setForm({ title: "", description: "", priority: "medium" });
      await loadIssues(projectId);
    } catch (err) {
      setError(getErrorMessage(err, "建立 Issue 失敗"));
    }
  };

  const moveIssue = async (issue, direction) => {
    const index = statusIndex(issue.statusId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= statuses.length) {
      return;
    }

    try {
      await transitionIssueStatus(issue.id, statuses[nextIndex].id);
      await loadIssues(projectId);
    } catch (err) {
      setError(getErrorMessage(err, "狀態更新失敗，請確認流程轉換規則"));
    }
  };

  if (loading) return <p className="text-sm text-gray-500">載入中...</p>;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{viewMode === "board" ? "Project Board" : "Project Issues"}</h1>
        <p className="text-sm text-gray-600">遵循規格流程：建立 Issue → 指派/優先級 → 狀態流轉（Todo→Doing→Done）。</p>
      </header>

      {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="rounded border px-3 py-2" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.key} - {project.name}
              </option>
            ))}
          </select>
          <input
            className="rounded border px-3 py-2"
            placeholder="搜尋 issue"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <input
            className="rounded border px-3 py-2"
            placeholder="快速建立 issue 標題"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <button type="button" onClick={() => document.getElementById("create-issue-form")?.scrollIntoView({ behavior: "smooth" })} className="rounded bg-blue-600 px-4 py-2 text-white">
            快速建立
          </button>
        </div>
        {selectedProject ? <p className="mt-2 text-xs text-gray-500">目前專案：{selectedProject.description}</p> : null}
      </section>

      <section id="create-issue-form" className="rounded-lg border bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
          <input
            className="rounded border px-3 py-2 md:col-span-2"
            value={form.title}
            placeholder="Issue 標題"
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <select className="rounded border px-3 py-2" value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>Priority: {priority}</option>
            ))}
          </select>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">新增</button>
          <textarea
            className="rounded border px-3 py-2 md:col-span-4"
            rows={2}
            placeholder="描述（可選）"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div>
          {viewMode === "board" ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {groupedIssues.map((column, columnIndex) => (
                <article key={column.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <h2 className="mb-3 text-lg font-semibold">{column.label}</h2>
                  <div className="space-y-2">
                    {column.items.map((issue) => (
                      <div key={issue.id} className="rounded border px-3 py-2" onClick={() => setSelectedIssueId(issue.id)}>
                        <p className="font-medium">#{issue.number} {issue.title}</p>
                        <p className="text-xs text-gray-500">Priority: {issue.priority}</p>
                        <div className="mt-2 flex gap-2">
                          <button type="button" onClick={() => moveIssue(issue, -1)} disabled={columnIndex === 0} className="rounded border px-2 py-1 text-xs disabled:opacity-40">←</button>
                          <button type="button" onClick={() => moveIssue(issue, 1)} disabled={columnIndex === statuses.length - 1} className="rounded border px-2 py-1 text-xs disabled:opacity-40">→</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <article className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Issue List</h2>
              <div className="space-y-2">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between rounded border px-3 py-2">
                    <button type="button" className="text-left" onClick={() => setSelectedIssueId(issue.id)}>
                      <p className="font-medium">#{issue.number} {issue.title}</p>
                      <p className="text-xs text-gray-500">{issue.statusId} / {issue.priority}</p>
                    </button>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveIssue(issue, -1)} className="rounded border px-2 py-1 text-xs">←</button>
                      <button type="button" onClick={() => moveIssue(issue, 1)} className="rounded border px-2 py-1 text-xs">→</button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>

        <aside className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Detail Panel</h2>
          {selectedIssue ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">#{selectedIssue.number} {selectedIssue.title}</p>
              <p>狀態：{selectedIssue.statusId}</p>
              <p>優先級：{selectedIssue.priority}</p>
              <p className="text-gray-500">這裡可擴充 comment / activity log / assignee。</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">請從左側選擇一個 Issue。</p>
          )}
        </aside>
      </section>
    </div>
  );
}
