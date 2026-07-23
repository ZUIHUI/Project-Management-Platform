import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notificationsService } from "../../services/notifications";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard.js";
import { canAccessProject, projectService } from "../project";
import { issueService, type IssuePayload } from "./issueService";
import { getWorkflowStatusLabel } from "./workflowPresentation.js";
import type { components } from "../../shared/api/schema";

type Project = components["schemas"]["Project"];
type Issue = components["schemas"]["Issue"];
type WorkflowStatus = components["schemas"]["WorkflowStatus"];
type Comment = components["schemas"]["Comment"];
type ActivityLog = components["schemas"]["ActivityLog"];

export type IssueDraft = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
};

export const useIssueWorkspace = (routeProjectId?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(routeProjectId ?? "");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesResolvedProjectId, setIssuesResolvedProjectId] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [notice, setNotice] = useState("");
  const [detailNotice, setDetailNotice] = useState("");
  const projectIdRef = useRef(projectId);
  const selectedIssueIdRef = useRef(selectedIssueId);
  const issuesRequestGuardRef = useRef(createLatestRequestGuard());
  const detailRequestGuardRef = useRef(createLatestRequestGuard());

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  useEffect(() => {
    selectedIssueIdRef.current = selectedIssueId;
  }, [selectedIssueId]);

  useEffect(() => () => {
    issuesRequestGuardRef.current.invalidate();
    detailRequestGuardRef.current.invalidate();
  }, []);

  useEffect(() => {
    setProjectId(routeProjectId ?? "");
  }, [routeProjectId]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      setError("");
      try {
        const [projectsResponse, statusesResponse] = await Promise.all([
          projectService.fetchProjects(),
          issueService.fetchStatuses(),
        ]);
        if (!active) return;

        const projectData = (projectsResponse.data?.data ?? []) as Project[];
        const statusData = [...((statusesResponse.data?.data ?? []) as WorkflowStatus[])].sort(
          (left, right) => left.order - right.order,
        );
        setProjects(projectData);
        setStatuses(statusData);
        setProjectId((current) => routeProjectId ?? (current || projectData[0]?.id || ""));
      } catch (bootstrapError) {
        if (active) setError(getApiErrorMessage(bootstrapError, "無法載入 Issue 工作區。"));
      } finally {
        if (active) setLoading(false);
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, [routeProjectId]);

  const loadIssues = useCallback(async (selectedProjectId: string) => {
    const requestToken = issuesRequestGuardRef.current.begin(selectedProjectId);
    setIssuesResolvedProjectId("");
    if (!selectedProjectId) {
      setIssues([]);
      setSelectedIssueId("");
      setIssuesLoading(false);
      return;
    }

    setIssuesLoading(true);
    setError("");
    try {
      const response = await issueService.fetchIssuesByProject(selectedProjectId, { page: 1, pageSize: 100 });
      const list = (response.data?.data ?? []) as Issue[];
      if (!issuesRequestGuardRef.current.isLatest(requestToken, projectIdRef.current)) return;
      setIssues(list);
      setSelectedIssueId((current) => (list.some((item) => item.id === current) ? current : list[0]?.id ?? ""));
      setIssuesResolvedProjectId(selectedProjectId);
    } catch (loadError) {
      if (!issuesRequestGuardRef.current.isLatest(requestToken, projectIdRef.current)) return;
      setIssues([]);
      setSelectedIssueId("");
      setError(getApiErrorMessage(loadError, "無法載入 Issue 清單。"));
    } finally {
      if (issuesRequestGuardRef.current.isLatest(requestToken, projectIdRef.current)) setIssuesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIssues(projectId);
  }, [loadIssues, projectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId) ?? null,
    [projectId, projects],
  );
  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId],
  );
  const canModify = Boolean(
    selectedProject && selectedProject.status !== "archived" && canAccessProject(selectedProject, "write"),
  );

  const loadIssueDetails = useCallback(async (issueId: string) => {
    const requestToken = detailRequestGuardRef.current.begin(issueId);
    setDetailError("");
    setDetailNotice("");
    if (!issueId) {
      setComments([]);
      setActivityLogs([]);
      setDetailLoading(false);
      return;
    }

    setComments([]);
    setActivityLogs([]);
    setDetailLoading(true);
    try {
      const [commentsResponse, activityResponse] = await Promise.all([
        issueService.fetchIssueComments(issueId),
        issueService.fetchIssueActivity(issueId, 20),
      ]);
      if (!detailRequestGuardRef.current.isLatest(requestToken, selectedIssueIdRef.current)) return;
      setComments((commentsResponse.data?.data ?? []) as Comment[]);
      setActivityLogs((activityResponse.data?.data ?? []) as ActivityLog[]);
    } catch (detailsError) {
      if (!detailRequestGuardRef.current.isLatest(requestToken, selectedIssueIdRef.current)) return;
      setDetailError(getApiErrorMessage(detailsError, "無法載入 Issue 詳細資訊。"));
    } finally {
      if (detailRequestGuardRef.current.isLatest(requestToken, selectedIssueIdRef.current)) setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIssueDetails(selectedIssueId);
  }, [loadIssueDetails, selectedIssueId]);

  const createIssue = useCallback(async (draft: IssueDraft) => {
    if (!projectId || !draft.title.trim() || !canModify) return false;
    setCreating(true);
    setCreateError("");
    setNotice("");
    try {
      const payload: IssuePayload = {
        title: draft.title.trim(),
        description: draft.description.trim() || undefined,
        priority: draft.priority,
      };
      const response = await issueService.createIssue(projectId, payload);
      const newIssue = response.data?.data as Issue | undefined;
      if (!newIssue) throw new Error("Issue 已建立，但伺服器未回傳工作資料。請重新載入確認結果。");
      setIssues((current) => [...current, newIssue]);
      setSelectedIssueId(newIssue.id);
      setNotice("Issue 已建立並加入工作區。");
      return newIssue;
    } catch (creationError) {
      setCreateError(getApiErrorMessage(creationError, "建立 Issue 失敗。"));
      return false;
    } finally {
      setCreating(false);
    }
  }, [canModify, projectId]);

  const transitionIssue = useCallback(async (issueId: string, nextStatusId: string) => {
    if (!canModify) return false;
    const issue = issues.find((item) => item.id === issueId);
    const currentStatus = statuses.find((status) => status.id === issue?.statusId);
    const nextStatus = statuses.find((status) => status.id === nextStatusId);
    if (!issue || !currentStatus || !nextStatus || currentStatus.id === nextStatus.id) return false;

    setError("");
    setNotice("");
    try {
      const response = await issueService.transitionIssueStatus(issue.id, nextStatus.id);
      const updatedIssue = (response.data?.data ?? {
        ...issue,
        statusId: nextStatus.id,
        updatedAt: new Date().toISOString(),
      }) as Issue;
      setIssues((current) => current.map((item) => (item.id === issue.id ? updatedIssue : item)));
      setNotice(`#${issue.number} 已移至「${getWorkflowStatusLabel(nextStatus)}」。`);

      void notificationsService.createNotification({
        type: "workflow_status_changed",
        message: `Issue #${issue.number} 已由 ${getWorkflowStatusLabel(currentStatus)} 轉為 ${getWorkflowStatusLabel(nextStatus)}`,
      }).catch(() => undefined);
      return true;
    } catch (transitionError) {
      setError(getApiErrorMessage(transitionError, "狀態更新失敗，請確認流程轉換規則。"));
      await loadIssues(projectId);
      return false;
    }
  }, [canModify, issues, loadIssues, projectId, statuses]);

  const moveIssue = useCallback(async (issueId: string, direction: number) => {
    const issue = issues.find((item) => item.id === issueId);
    if (!issue) return false;
    const currentIndex = statuses.findIndex((status) => status.id === issue.statusId);
    const nextStatus = statuses[currentIndex + direction];
    if (currentIndex < 0 || !nextStatus) return false;
    return transitionIssue(issue.id, nextStatus.id);
  }, [issues, statuses, transitionIssue]);

  const assignIssue = useCallback(async (issueId: string, assigneeId: string) => {
    if (!canModify) return false;
    setDetailSaving(true);
    setDetailError("");
    setDetailNotice("");
    try {
      await issueService.assignIssue(issueId, assigneeId || null);
      setIssues((current) => current.map((item) => (
        item.id === issueId
          ? { ...item, assigneeId: assigneeId || null, updatedAt: new Date().toISOString() }
          : item
      )));
      if (selectedIssueIdRef.current === issueId) {
        await loadIssueDetails(issueId);
        if (selectedIssueIdRef.current === issueId) setDetailNotice("Issue 指派已更新。");
      }
      return true;
    } catch (assignmentError) {
      const message = getApiErrorMessage(assignmentError, "指派失敗。");
      if (selectedIssueIdRef.current === issueId) {
        await Promise.all([loadIssues(projectId), loadIssueDetails(issueId)]);
        if (selectedIssueIdRef.current === issueId) setDetailError(message);
      } else {
        await loadIssues(projectId);
        setError(message);
      }
      return false;
    } finally {
      setDetailSaving(false);
    }
  }, [canModify, loadIssueDetails, loadIssues, projectId]);

  const addComment = useCallback(async (issueId: string, body: string) => {
    if (!canModify || !body.trim()) return false;
    setDetailSaving(true);
    setDetailError("");
    setDetailNotice("");
    try {
      await issueService.createIssueComment(issueId, body.trim());
      if (selectedIssueIdRef.current === issueId) {
        await loadIssueDetails(issueId);
        if (selectedIssueIdRef.current === issueId) setDetailNotice("留言已送出。");
      }
      return true;
    } catch (commentError) {
      const message = getApiErrorMessage(commentError, "留言新增失敗。");
      if (selectedIssueIdRef.current === issueId) setDetailError(message);
      else setError(message);
      return false;
    } finally {
      setDetailSaving(false);
    }
  }, [canModify, loadIssueDetails]);

  const clearFeedback = useCallback(() => {
    setError("");
    setNotice("");
  }, []);
  const clearCreateError = useCallback(() => setCreateError(""), []);
  const clearDetailFeedback = useCallback(() => {
    setDetailError("");
    setDetailNotice("");
  }, []);
  const reloadIssues = useCallback(() => loadIssues(projectId), [loadIssues, projectId]);
  const reloadDetails = useCallback(
    () => loadIssueDetails(selectedIssueId),
    [loadIssueDetails, selectedIssueId],
  );

  return {
    projects,
    projectId,
    setProjectId,
    selectedProject,
    issues,
    statuses,
    selectedIssue,
    selectedIssueId,
    setSelectedIssueId,
    comments,
    activityLogs,
    canModify,
    loading,
    issuesLoading,
    issuesResolvedProjectId,
    detailLoading,
    creating,
    detailSaving,
    error,
    createError,
    detailError,
    notice,
    detailNotice,
    clearFeedback,
    clearCreateError,
    clearDetailFeedback,
    reloadIssues,
    reloadDetails,
    createIssue,
    moveIssue,
    transitionIssueStatus: transitionIssue,
    assignIssue,
    addComment,
  };
};
