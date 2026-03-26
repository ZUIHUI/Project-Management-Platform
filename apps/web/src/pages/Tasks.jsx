import { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../services/projects";
import {
  fetchIssuesByProject,
  createIssue,
  transitionIssueStatus,
} from "../services/task";

const STATUS_SEQUENCE = ["todo", "doing", "done"];

export default function Tasks() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchProjects();
        const projectData = response.data?.data ?? [];
        setProjects(projectData);
        if (projectData.length > 0) {
          setProjectId(projectData[0].id);
        }
      } catch (err) {
        setError("無法載入專案清單");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const loadIssues = async (selectedProjectId) => {
    if (!selectedProjectId) {
      setIssues([]);
      return;
    }

    try {
      const response = await fetchIssuesByProject(selectedProjectId);
      setIssues(response.data?.data ?? []);
    } catch (err) {
      setError("無法載入 Issue 清單");
    }
  };

  useEffect(() => {
    loadIssues(projectId);
  }, [projectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projects, projectId],
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!projectId || !title.trim()) {
      return;
    }

    try {
      await createIssue(projectId, {
        title: title.trim(),
        reporterId: "user-pm",
      });
      setTitle("");
      await loadIssues(projectId);
    } catch (err) {
      setError("建立 Issue 失敗");
    }
  };

  const handleMove = async (issue) => {
    const index = STATUS_SEQUENCE.indexOf(issue.statusId);
    if (index === -1 || index === STATUS_SEQUENCE.length - 1) {
      return;
    }

    const nextStatus = STATUS_SEQUENCE[index + 1];
    try {
      await transitionIssueStatus(issue.id, nextStatus);
      await loadIssues(projectId);
    } catch (err) {
      setError("狀態更新失敗，請確認流程轉換規則");
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">載入中...</p>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Issues（重構版）</h1>
        <p className="text-sm text-gray-600">
          以 Project → Issue 為核心流程，支援狀態流轉（todo → doing → done）。
        </p>
      </header>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium">選擇專案</label>
        <select
          className="w-full rounded border px-3 py-2"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.key} - {project.name}
            </option>
          ))}
        </select>
        {selectedProject ? (
          <p className="mt-2 text-xs text-gray-500">目前專案：{selectedProject.description}</p>
        ) : null}
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleCreate}>
          <input
            className="flex-1 rounded border px-3 py-2"
            value={title}
            placeholder="新增 Issue 標題"
            onChange={(event) => setTitle(event.target.value)}
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            新增 Issue
          </button>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Issue 清單</h2>
        <div className="space-y-2">
          {issues.map((issue) => (
            <article
              key={issue.id}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <div>
                <p className="font-medium">
                  #{issue.number} {issue.title}
                </p>
                <p className="text-xs text-gray-500">
                  狀態：{issue.statusId}｜優先級：{issue.priority}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleMove(issue)}
                disabled={issue.statusId === "done"}
                className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {issue.statusId === "done" ? "已完成" : "前進下一狀態"}
              </button>
            </article>
          ))}
          {issues.length === 0 ? (
            <p className="text-sm text-gray-500">此專案目前沒有 Issue。</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
