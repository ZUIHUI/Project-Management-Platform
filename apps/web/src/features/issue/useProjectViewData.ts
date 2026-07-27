import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import { canAccessProject, projectService } from "../project";
import { buildProjectMemberLabelMap } from "../project/projectMemberPresentation";
import { isIssueCollectionPending } from "./issueRouteState.js";
import { issueService } from "./issueService";
import {
  buildWorkflowStatusOptions,
  getWorkflowStatusLabel,
  getWorkflowTransitionTargets,
  isCoreWorkflowReady,
} from "./workflowPresentation.js";
import type { components } from "../../shared/api/schema";

type Project = components["schemas"]["Project"];
type WorkflowStatus = components["schemas"]["WorkflowStatus"];
type Issue = components["schemas"]["Issue"];

export type ProjectTaskView = Issue & {
  statusLabel: string;
  assignee: string | null;
  assigneeLabel: string | null;
  dueDate: string | null;
};

export type ProjectTeamMemberView = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const useProjectViewData = (fixedProjectId?: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(fixedProjectId ?? "");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuesResolvedProjectId, setIssuesResolvedProjectId] = useState("");
  const [projectError, setProjectError] = useState("");
  const [issueError, setIssueError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [issueNotice, setIssueNotice] = useState("");
  const [transitioningIssueIds, setTransitioningIssueIds] = useState<string[]>([]);
  const [scopeRetryNonce, setScopeRetryNonce] = useState(0);
  const issueRequestId = useRef(0);
  const selectedProjectIdRef = useRef(selectedProjectId);
  const transitioningIssueIdsRef = useRef(new Set<string>());

  useEffect(() => {
    selectedProjectIdRef.current = selectedProjectId;
    setOperationError("");
    setIssueNotice("");
  }, [selectedProjectId]);

  useEffect(() => {
    setSelectedProjectId(fixedProjectId ?? "");
  }, [fixedProjectId]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      issueRequestId.current += 1;
      setIssues([]);
      setIssuesResolvedProjectId("");
      setIssueError("");
      setOperationError("");
      setIssueNotice("");
      setLoadingIssues(false);
      setLoadingProjects(true);
      setProjectError("");
      try {
        const [projectsResponse, statusesResponse] = await Promise.all([
          projectService.fetchProjects(),
          issueService.fetchStatuses(),
        ]);
        if (!active) return;

        const projectData = (projectsResponse.data?.data ?? []) as Project[];
        const statusData = ((statusesResponse.data?.data ?? []) as WorkflowStatus[]).sort(
          (left, right) => left.order - right.order,
        );
        setProjects(projectData);
        setStatuses(statusData);
        setSelectedProjectId((current) => fixedProjectId ?? (current || projectData[0]?.id || ""));
      } catch (bootstrapError) {
        if (active) {
          setProjects([]);
          setStatuses([]);
          setProjectError(getApiErrorMessage(bootstrapError, "無法載入專案資料，請稍後再試。"));
        }
      } finally {
        if (active) setLoadingProjects(false);
      }
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, [fixedProjectId, scopeRetryNonce]);

  const loadIssues = useCallback(async (projectId: string) => {
    const requestId = ++issueRequestId.current;
    if (!projectId) {
      setIssues([]);
      setIssuesResolvedProjectId("");
      setIssueError("");
      setLoadingIssues(false);
      return;
    }

    setLoadingIssues(true);
    setIssueError("");
    setIssueNotice("");
    try {
      const response = await issueService.fetchIssuesByProject(projectId, { page: 1, pageSize: 100 });
      if (requestId === issueRequestId.current) {
        setIssues((response.data?.data ?? []) as Issue[]);
      }
    } catch (loadError) {
      if (requestId === issueRequestId.current) {
        setIssues([]);
        setIssueError(getApiErrorMessage(loadError, "無法載入 Issue 資料，請稍後再試。"));
      }
    } finally {
      if (requestId === issueRequestId.current) {
        setIssuesResolvedProjectId(projectId);
        setLoadingIssues(false);
      }
    }
  }, []);

  useEffect(() => {
    if (loadingProjects || projectError) return;
    void loadIssues(selectedProjectId);
  }, [loadIssues, loadingProjects, projectError, selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const canWrite = Boolean(
    selectedProject && selectedProject.status !== "archived" && canAccessProject(selectedProject, "write"),
  );
  const issuesPending = Boolean(
    selectedProject
    && !projectError
    && isIssueCollectionPending(selectedProjectId, issuesResolvedProjectId, loadingIssues),
  );

  const tasks = useMemo<ProjectTaskView[]>(() => {
    const statusLabels = new Map(buildWorkflowStatusOptions(statuses).map((status) => [status.id, status.label]));
    const memberLabels = buildProjectMemberLabelMap(selectedProject?.members ?? []);
    return issues.map((issue) => ({
      ...issue,
      statusLabel: statusLabels.get(issue.statusId) ?? issue.statusId,
      assignee: issue.assigneeId ?? null,
      assigneeLabel: issue.assigneeId ? memberLabels.get(issue.assigneeId) ?? issue.assigneeId : null,
      dueDate: issue.dueAt ?? null,
    }));
  }, [issues, selectedProject?.members, statuses]);

  const statusOptions = useMemo(() => buildWorkflowStatusOptions(statuses), [statuses]);
  const workflowReady = useMemo(() => isCoreWorkflowReady(statuses), [statuses]);
  const canUseWorkflow = canWrite && workflowReady;

  const team = useMemo<ProjectTeamMemberView[]>(
    () =>
      (selectedProject?.members ?? []).map((member) => ({
          id: member.userId ?? "",
          name: member.name ?? member.userId ?? "",
          email: member.email ?? "",
          role: member.role ?? "viewer",
        })).filter((member) => member.id),
    [selectedProject],
  );

  const transitionTask = useCallback(
    async (issueId: string, nextStatusId: string, throwOnError = false) => {
      if (!canWrite || !workflowReady) return false;
      const target = statuses.find((status) => status.id === nextStatusId);
      if (!target) {
        const error = new Error(`找不到目標狀態「${nextStatusId}」。`);
        setOperationError(error.message);
        if (throwOnError) throw error;
        return false;
      }

      const current = issues.find((issue) => issue.id === issueId);
      if (!current || current.statusId === target.id) return false;
      if (!getWorkflowTransitionTargets(statuses, current.statusId).some((status) => status.id === target.id)) {
        const error = new Error("此狀態轉換不在目前工作流程中。");
        setOperationError(error.message);
        if (throwOnError) throw error;
        return false;
      }
      if (transitioningIssueIdsRef.current.has(issueId)) return false;

      const requestProjectId = selectedProjectIdRef.current;
      transitioningIssueIdsRef.current.add(issueId);
      setTransitioningIssueIds((items) => items.includes(issueId) ? items : [...items, issueId]);
      setOperationError("");
      setIssueNotice("");

      try {
        const response = await issueService.transitionIssueStatus(issueId, target.id);
        if (selectedProjectIdRef.current !== requestProjectId) return false;
        const updated = (response.data?.data ?? { ...current, statusId: target.id }) as Issue;
        setIssues((items) => items.map((item) => (item.id === issueId ? updated : item)));
        setIssueNotice(`#${current.number} 已移至「${getWorkflowStatusLabel(target)}」。`);
        return true;
      } catch (transitionError) {
        if (selectedProjectIdRef.current !== requestProjectId) return false;
        const message = getApiErrorMessage(transitionError, "狀態更新失敗，已重新整理最新資料。");
        await loadIssues(requestProjectId);
        if (selectedProjectIdRef.current === requestProjectId) setOperationError(message);
        if (throwOnError) throw transitionError;
        return false;
      } finally {
        transitioningIssueIdsRef.current.delete(issueId);
        setTransitioningIssueIds((items) => items.filter((id) => id !== issueId));
      }
    },
    [canWrite, issues, loadIssues, statuses, workflowReady],
  );

  const updateTask = useCallback(
    async (task: ProjectTaskView) => {
      const requestProjectId = selectedProjectIdRef.current;
      setOperationError("");
      setIssueNotice("");
      try {
        const response = await issueService.updateIssue(task.id, {
          title: task.title,
          description: task.description,
          priority: task.priority,
          assigneeId: task.assignee || null,
          dueAt: task.dueDate,
        });
        if (selectedProjectIdRef.current !== requestProjectId) return false;
        const updated = response.data?.data as Issue | undefined;
        if (updated) {
          setIssues((items) => items.map((item) => (item.id === task.id ? updated : item)));
        }
        setIssueNotice(`#${task.number} 的內容已更新。`);
        return true;
      } catch (updateError) {
        if (selectedProjectIdRef.current !== requestProjectId) return false;
        const message = getApiErrorMessage(updateError, "Issue 更新失敗，已重新整理最新資料。");
        await loadIssues(requestProjectId);
        if (selectedProjectIdRef.current === requestProjectId) setOperationError(message);
        throw updateError;
      }
    },
    [loadIssues],
  );

  return {
    projects,
    statuses,
    statusOptions,
    workflowReady,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    canWrite,
    canUseWorkflow,
    tasks,
    team,
    loading: loadingProjects || issuesPending,
    scopeLoading: loadingProjects,
    error: projectError || issueError,
    operationError,
    notice: issueNotice,
    transitioningIssueIds,
    reload: () => loadIssues(selectedProjectId),
    retry: projectError || !workflowReady
      ? () => setScopeRetryNonce((current) => current + 1)
      : () => loadIssues(selectedProjectId),
    transitionTask,
    updateTask,
  };
};
