import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import type { components } from "../../shared/api/schema";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard.js";
import { canAccessProject } from "./projectAccess";
import { projectService } from "./projectService";
import { buildProjectPlanningScope } from "./projectWorkspaceState.js";
import type { MilestoneDraft, SprintDraft } from "./useProjectsWorkspace";

type Project = components["schemas"]["Project"];
type Milestone = components["schemas"]["Milestone"];
type Sprint = components["schemas"]["Sprint"];
export type ProjectPlanningKind = "milestone" | "sprint";
export type ProjectPlanningItem = Milestone | Sprint;

export const useProjectPlanningWorkspace = (projectId: string, kind: ProjectPlanningKind) => {
  const workspaceScope = buildProjectPlanningScope(projectId, kind);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<ProjectPlanningItem[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [notice, setNotice] = useState("");
  const [resolvedScope, setResolvedScope] = useState("");
  const currentScopeRef = useRef(workspaceScope);
  const workspaceRequestGuardRef = useRef(createLatestRequestGuard());
  const createRequestGuardRef = useRef(createLatestRequestGuard());
  currentScopeRef.current = workspaceScope;

  const loadWorkspace = useCallback(async () => {
    const requestGuard = workspaceRequestGuardRef.current;
    const request = requestGuard.begin(workspaceScope);
    if (!projectId) {
      setProject(null);
      setItems([]);
      setResolvedScope(workspaceScope);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await projectService.fetchProjectById(projectId);
      if (!requestGuard.isLatest(request, currentScopeRef.current)) return;
      const data = response.data?.data as Project | undefined;
      if (!data) throw new Error("專案回應沒有資料。");
      setProject(data);
      setItems(((kind === "milestone" ? data.milestones : data.sprints) ?? []) as ProjectPlanningItem[]);
      setResolvedScope(workspaceScope);
    } catch (loadError) {
      if (!requestGuard.isLatest(request, currentScopeRef.current)) return;
      setProject(null);
      setItems([]);
      setResolvedScope(workspaceScope);
      setError(getApiErrorMessage(loadError, kind === "milestone" ? "無法載入里程碑。" : "無法載入 Sprint。"));
    } finally {
      if (requestGuard.isLatest(request, currentScopeRef.current)) setLoading(false);
    }
  }, [kind, projectId, workspaceScope]);

  useEffect(() => {
    createRequestGuardRef.current.invalidate();
    setSaving(false);
    setCreateError("");
    setNotice("");
    void loadWorkspace();
    return () => {
      workspaceRequestGuardRef.current.invalidate();
      createRequestGuardRef.current.invalidate();
    };
  }, [loadWorkspace, workspaceScope]);

  const scopeResolved = resolvedScope === workspaceScope;
  const currentProject = scopeResolved ? project : null;
  const currentItems = scopeResolved ? items : [];
  const currentError = scopeResolved ? error : "";
  const currentCreateError = scopeResolved ? createError : "";
  const currentNotice = scopeResolved ? notice : "";
  const currentLoading = Boolean(projectId) && (loading || !scopeResolved);
  const projectArchived = currentProject?.status === "archived";
  const canWrite = Boolean(currentProject && !projectArchived && canAccessProject(currentProject, "write"));

  const createItem = useCallback(async (draft: MilestoneDraft | SprintDraft) => {
    if (!projectId || !draft.name.trim() || !canWrite) return false;
    const requestGuard = createRequestGuardRef.current;
    const request = requestGuard.begin(workspaceScope);
    setSaving(true);
    setCreateError("");
    setNotice("");
    try {
      const response = kind === "milestone"
        ? await projectService.createMilestone(projectId, {
            name: draft.name.trim(),
            dueAt: "dueAt" in draft ? draft.dueAt : undefined,
          })
        : await projectService.createSprint(projectId, {
            name: draft.name.trim(),
            goal: "goal" in draft ? draft.goal?.trim() || undefined : undefined,
            startAt: "startAt" in draft ? draft.startAt : undefined,
            endAt: "endAt" in draft ? draft.endAt : undefined,
          });
      const created = response.data?.data as ProjectPlanningItem | undefined;
      if (!created) throw new Error(`${kind === "milestone" ? "里程碑" : "Sprint"}建立完成，但伺服器未回傳資料。`);
      if (!requestGuard.isLatest(request, currentScopeRef.current)) return false;
      setItems((current) => [...current, created]);
      setNotice(`${kind === "milestone" ? "里程碑" : "Sprint"}「${created.name}」已建立。`);
      return true;
    } catch (creationError) {
      if (!requestGuard.isLatest(request, currentScopeRef.current)) return false;
      setCreateError(getApiErrorMessage(creationError, `${kind === "milestone" ? "里程碑" : "Sprint"}建立失敗。`));
      return false;
    } finally {
      if (requestGuard.isLatest(request, currentScopeRef.current)) setSaving(false);
    }
  }, [canWrite, kind, projectId, workspaceScope]);

  const sortedItems = useMemo(() => [...currentItems].sort((left, right) => {
    if (kind === "milestone") {
      const leftDue = "dueAt" in left && left.dueAt ? new Date(left.dueAt).getTime() : Number.POSITIVE_INFINITY;
      const rightDue = "dueAt" in right && right.dueAt ? new Date(right.dueAt).getTime() : Number.POSITIVE_INFINITY;
      return leftDue - rightDue;
    }
    const leftStart = "startAt" in left && left.startAt ? new Date(left.startAt).getTime() : Number.POSITIVE_INFINITY;
    const rightStart = "startAt" in right && right.startAt ? new Date(right.startAt).getTime() : Number.POSITIVE_INFINITY;
    return leftStart - rightStart;
  }), [currentItems, kind]);
  const clearCreateError = useCallback(() => setCreateError(""), []);

  return {
    project: currentProject,
    items: sortedItems,
    projectArchived,
    canWrite,
    loading: currentLoading,
    saving,
    error: currentError,
    createError: currentCreateError,
    notice: currentNotice,
    refresh: loadWorkspace,
    clearCreateError,
    createItem,
  };
};
