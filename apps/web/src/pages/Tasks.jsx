import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { projectService } from "../features/project";
import { issueService } from "../features/issue";
import { notificationsService } from "../services/notifications";
import { authService } from "../features/auth/authService";

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
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
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
        const [projectsRes, statusesRes] = await Promise.all([projectService.fetchProjects(), issueService.fetchStatuses()]);

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
      const response = await issueService.fetchIssuesByProject(selectedProjectId, {
        q: keyword || undefined,
        page: 1,
        pageSize: 100,
      });
      const list = response.data?.data ?? [];
      setIssues(list);
      if (!list.length) {
        setSelectedIssueId("");
        return;
      }

      setSelectedIssueId((currentId) => (list.some((item) => item.id === currentId) ? currentId : list[0].id));
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
  const projectMembers = useMemo(() => selectedProject?.members ?? [], [selectedProject]);

  const loadIssueDetails = useCallback(async (issueId) => {
    if (!issueId) {
      setComments([]);
      setActivityLogs([]);
      return;
    }

    setDetailLoading(true);
    try {
      const [commentsRes, activityRes] = await Promise.all([
        issueService.fetchIssueComments(issueId),
        issueService.fetchIssueActivity(issueId, 20),
      ]);
      setComments(commentsRes.data?.data ?? []);
      setActivityLogs(activityRes.data?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "無法載入 Issue 詳細資訊"));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssueDetails(selectedIssueId);
  }, [selectedIssueId, loadIssueDetails]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!projectId || !form.title.trim()) {
      return;
    }

    try {
      const response = await issueService.createIssue(projectId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        reporterId: "user-pm",
      });
      
      // 立即更新本地狀態，而不是重新載入
      const newIssue = response.data?.data;
      if (newIssue) {
        setIssues(prev => [...prev, newIssue]);
      }
      
      setForm({ title: "", description: "", priority: "medium" });
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
      await issueService.transitionIssueStatus(issue.id, statuses[nextIndex].id);
      
      // 立即更新本地狀態
      setIssues(prev => prev.map(item => 
        item.id === issue.id 
          ? { ...item, statusId: statuses[nextIndex].id, updatedAt: new Date().toISOString() }
          : item
      ));
      
      const currentUser = authService.getCurrentUser();
      if (currentUser?.id) {
        await notificationsService.createNotification({
          userId: currentUser.id,
          type: "workflow_status_changed",
          message: `Issue #${issue.number} 已由 ${statuses[index].name} 轉為 ${statuses[nextIndex].name}`,
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, "狀態更新失敗，請確認流程轉換規則"));
      // 如果失敗，重新載入數據以恢復正確狀態
      await loadIssues(projectId);
    }
  };

  const handleAssign = async (issueId, assigneeId) => {
    try {
      setDetailSaving(true);
      await issueService.assignIssue(issueId, assigneeId || null);
      
      // 立即更新本地狀態
      setIssues(prev => prev.map(item => 
        item.id === issueId 
          ? { ...item, assigneeId: assigneeId || null, updatedAt: new Date().toISOString() }
          : item
      ));
      
      await loadIssueDetails(issueId);
    } catch (err) {
      setError(getErrorMessage(err, "指派失敗"));
      // 如果失敗，重新載入數據以恢復正確狀態
      await Promise.all([loadIssues(projectId), loadIssueDetails(issueId)]);
    } finally {
      setDetailSaving(false);
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!selectedIssueId || !commentDraft.trim()) return;

    try {
      setDetailSaving(true);
      await issueService.createIssueComment(selectedIssueId, commentDraft.trim());
      setCommentDraft("");
      await loadIssueDetails(selectedIssueId);
    } catch (err) {
      setError(getErrorMessage(err, "留言新增失敗"));
    } finally {
      setDetailSaving(false);
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
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">#{selectedIssue.number} {selectedIssue.title}</p>
                <p>狀態：{selectedIssue.statusId}</p>
                <p>優先級：{selectedIssue.priority}</p>
                <label className="flex flex-col gap-1">
                  <span>指派成員</span>
                  <select
                    className="rounded border px-2 py-1"
                    value={selectedIssue.assigneeId ?? ""}
                    disabled={detailSaving}
                    onChange={(event) => handleAssign(selectedIssue.id, event.target.value)}
                  >
                    <option value="">未指派</option>
                    {projectMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.userId} ({member.role})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <section className="space-y-2">
                <h3 className="font-semibold">Comments</h3>
                <form className="space-y-2" onSubmit={submitComment}>
                  <textarea
                    className="w-full rounded border px-2 py-1"
                    rows={2}
                    placeholder="輸入留言，可用 @name 提及成員"
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    disabled={detailSaving}
                  />
                  <button type="submit" className="rounded bg-slate-900 px-3 py-1 text-xs text-white disabled:opacity-50" disabled={detailSaving || !commentDraft.trim()}>
                    送出留言
                  </button>
                </form>
                <div className="max-h-48 space-y-2 overflow-auto pr-1">
                  {comments.map((comment) => (
                    <article key={comment.id} className="rounded border p-2">
                      <p className="text-xs text-gray-500">{comment.authorId ?? "anonymous"} · {new Date(comment.createdAt).toLocaleString()}</p>
                      <p className="whitespace-pre-wrap">{comment.body}</p>
                    </article>
                  ))}
                  {!comments.length && !detailLoading ? <p className="text-xs text-gray-500">目前沒有留言</p> : null}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold">Activity</h3>
                <div className="max-h-48 space-y-2 overflow-auto pr-1">
                  {activityLogs.map((log) => (
                    <article key={log.id} className="rounded border p-2">
                      <p className="text-xs text-gray-500">{log.actorId ?? "system"} · {new Date(log.createdAt).toLocaleString()}</p>
                      <p>{log.action}</p>
                    </article>
                  ))}
                  {!activityLogs.length && !detailLoading ? <p className="text-xs text-gray-500">目前沒有活動紀錄</p> : null}
                </div>
              </section>

              {detailLoading ? <p className="text-xs text-gray-500">詳細資料載入中...</p> : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">請從左側選擇一個 Issue。</p>
          )}
        </aside>
      </section>
    </div>
  );
}
