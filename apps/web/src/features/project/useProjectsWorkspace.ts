import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import type { components } from "../../shared/api/schema";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard.js";
import { authService } from "../auth/authService";
import { canAccessProject } from "./projectAccess";
import { presentProjectCreateError } from "./projectActionErrorPresentation.js";
import { projectService } from "./projectService";

type Project = components["schemas"]["Project"];
type Milestone = components["schemas"]["Milestone"];
type Sprint = components["schemas"]["Sprint"];

export type ProjectDraft = {
  key: string;
  name: string;
  description: string;
};

export type MilestoneDraft = {
  name: string;
  dueAt?: string;
};

export type SprintDraft = {
  name: string;
  goal?: string;
  startAt?: string;
  endAt?: string | null;
};

type BusyAction = "" | "project" | "archive" | "milestone" | "sprint";

export const useProjectsWorkspace = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<BusyAction>("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createError, setCreateError] = useState("");
  const [createErrorField, setCreateErrorField] = useState<"" | "key">("");
  const [milestoneError, setMilestoneError] = useState("");
  const [sprintError, setSprintError] = useState("");
  const [archiveError, setArchiveError] = useState("");
  const projectsRequestGuardRef = useRef(createLatestRequestGuard());

  const loadProjects = useCallback(async () => {
    const requestGuard = projectsRequestGuardRef.current;
    const requestScope = "projects";
    const request = requestGuard.begin(requestScope);
    setLoading(true);
    setError("");
    try {
      const response = await projectService.fetchProjects({ page: 1, pageSize: 100 });
      if (!requestGuard.isLatest(request, requestScope)) return;
      const list = (response.data?.data ?? []) as Project[];
      setProjects(list);
      setSelectedProjectId((current) => (
        list.some((project) => project.id === current) ? current : list[0]?.id ?? ""
      ));
    } catch (loadError) {
      if (!requestGuard.isLatest(request, requestScope)) return;
      setProjects([]);
      setSelectedProjectId("");
      setError(getApiErrorMessage(loadError, "無法載入專案，請稍後再試。"));
    } finally {
      if (requestGuard.isLatest(request, requestScope)) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
    return () => projectsRequestGuardRef.current.invalidate();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase();
    if (!query) return projects;
    return projects.filter((project) => [project.key, project.name, project.description]
      .some((value) => value?.toLocaleLowerCase().includes(query)));
  }, [keyword, projects]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const selectedProjectArchived = selectedProject?.status === "archived";
  const canContribute = Boolean(
    selectedProject && !selectedProjectArchived && canAccessProject(selectedProject, "write"),
  );
  const canAdminister = Boolean(
    selectedProject && !selectedProjectArchived && canAccessProject(selectedProject, "admin"),
  );
  const activeCount = useMemo(
    () => projects.filter((project) => project.status !== "archived").length,
    [projects],
  );

  const replaceProject = useCallback((project: Project) => {
    setProjects((current) => current.map((item) => (item.id === project.id ? project : item)));
  }, []);

  const createProject = useCallback(async (draft: ProjectDraft) => {
    if (!draft.key.trim() || !draft.name.trim()) return false;
    setBusyAction("project");
    setCreateError("");
    setCreateErrorField("");
    setNotice("");
    try {
      const response = await projectService.createProject({
        key: draft.key.trim().toUpperCase(),
        name: draft.name.trim(),
        description: draft.description.trim(),
      });
      const created = response.data?.data as Project | undefined;
      if (!created) throw new Error("專案建立完成，但伺服器未回傳專案資料。請重新整理確認結果。");
      setProjects((current) => [created, ...current.filter((project) => project.id !== created.id)]);
      setSelectedProjectId(created.id);
      setNotice(`「${created.name}」已建立，可以開始安排交付內容。`);
      return true;
    } catch (creationError) {
      const presentation = presentProjectCreateError(creationError, "建立專案失敗，請稍後再試。");
      setCreateError(presentation.message);
      setCreateErrorField(presentation.field);
      return false;
    } finally {
      setBusyAction("");
    }
  }, []);

  const createMilestone = useCallback(async (draft: MilestoneDraft) => {
    if (!selectedProjectId || !draft.name.trim() || !canContribute) return false;
    setBusyAction("milestone");
    setMilestoneError("");
    setNotice("");
    try {
      const response = await projectService.createMilestone(selectedProjectId, {
        name: draft.name.trim(),
        dueAt: draft.dueAt,
      });
      const milestone = response.data?.data as Milestone | undefined;
      if (!milestone) throw new Error("里程碑建立完成，但伺服器未回傳里程碑資料。請重新整理確認結果。");
      setProjects((current) => current.map((project) => (
        project.id === selectedProjectId
          ? { ...project, milestones: [...(project.milestones ?? []), milestone] }
          : project
      )));
      setNotice(`里程碑「${milestone.name}」已加入交付計畫。`);
      return true;
    } catch (creationError) {
      setMilestoneError(getApiErrorMessage(creationError, "建立里程碑失敗。"));
      return false;
    } finally {
      setBusyAction("");
    }
  }, [canContribute, selectedProjectId]);

  const createSprint = useCallback(async (draft: SprintDraft) => {
    if (!selectedProjectId || !draft.name.trim() || !canContribute) return false;
    setBusyAction("sprint");
    setSprintError("");
    setNotice("");
    try {
      const response = await projectService.createSprint(selectedProjectId, {
        name: draft.name.trim(),
        goal: draft.goal?.trim() || undefined,
        startAt: draft.startAt,
        endAt: draft.endAt,
      });
      const sprint = response.data?.data as Sprint | undefined;
      if (!sprint) throw new Error("Sprint 建立完成，但伺服器未回傳 Sprint 資料。請重新整理確認結果。");
      setProjects((current) => current.map((project) => (
        project.id === selectedProjectId
          ? { ...project, sprints: [...(project.sprints ?? []), sprint] }
          : project
      )));
      setNotice(`Sprint「${sprint.name}」已建立。`);
      return true;
    } catch (creationError) {
      setSprintError(getApiErrorMessage(creationError, "建立 Sprint 失敗。"));
      return false;
    } finally {
      setBusyAction("");
    }
  }, [canContribute, selectedProjectId]);

  const archiveProject = useCallback(async (project: Project) => {
    if (!canAccessProject(project, "admin") || project.status === "archived") return false;
    setBusyAction("archive");
    setArchiveError("");
    setNotice("");
    try {
      const response = await projectService.archiveProject(project.id);
      const archived = response.data?.data as Project | undefined;
      if (!archived) throw new Error("專案封存完成，但伺服器未回傳專案資料。請重新整理確認結果。");
      replaceProject(archived);
      setNotice(`「${archived.name}」已封存。`);
      return true;
    } catch (archiveFailure) {
      setArchiveError(getApiErrorMessage(archiveFailure, "無法封存專案。"));
      return false;
    } finally {
      setBusyAction("");
    }
  }, [replaceProject]);

  const clearFeedback = useCallback(() => {
    setError("");
    setNotice("");
  }, []);
  const clearCreateError = useCallback(() => {
    setCreateError("");
    setCreateErrorField("");
  }, []);
  const clearMilestoneError = useCallback(() => setMilestoneError(""), []);
  const clearSprintError = useCallback(() => setSprintError(""), []);
  const clearArchiveError = useCallback(() => setArchiveError(""), []);
  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setError("");
    setNotice("");
    setMilestoneError("");
    setSprintError("");
    setArchiveError("");
  }, []);

  return {
    projects,
    filteredProjects,
    keyword,
    setKeyword,
    selectedProjectId,
    selectProject,
    selectedProject,
    selectedProjectArchived,
    activeCount,
    canCreateProject: authService.hasRole("project_admin"),
    canContribute,
    canAdminister,
    loading,
    busyAction,
    error,
    notice,
    createError,
    createErrorField,
    milestoneError,
    sprintError,
    archiveError,
    clearFeedback,
    clearCreateError,
    clearMilestoneError,
    clearSprintError,
    clearArchiveError,
    refresh: loadProjects,
    createProject,
    createMilestone,
    createSprint,
    archiveProject,
  };
};
