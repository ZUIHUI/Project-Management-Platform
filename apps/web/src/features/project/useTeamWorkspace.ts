import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import type { components } from "../../shared/api/schema";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard";
import { canAccessProject } from "./projectAccess";
import { presentTeamMemberError } from "./projectActionErrorPresentation.js";
import { projectService } from "./projectService";

type Project = components["schemas"]["Project"];
type ProjectMember = NonNullable<Project["members"]>[number];
type MemberCandidate = components["schemas"]["MemberCandidate"];
export type ProjectMemberRole = "viewer" | "member" | "project_admin";

export const useTeamWorkspace = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyMemberIds, setBusyMemberIds] = useState<string[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState("");
  const [addError, setAddError] = useState("");
  const [addErrorField, setAddErrorField] = useState<"" | "userId">("");
  const [notice, setNotice] = useState("");
  const [memberCandidates, setMemberCandidates] = useState<MemberCandidate[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const projectRequestGuardRef = useRef(createLatestRequestGuard());
  const candidateRequestGuardRef = useRef(createLatestRequestGuard());
  const busyMemberIdsRef = useRef(new Set<string>());
  const addingMemberRef = useRef(false);

  const loadProjects = useCallback(async () => {
    const requestGuard = projectRequestGuardRef.current;
    const requestScope = "projects";
    const request = requestGuard.begin(requestScope);
    setLoading(true);
    setError("");
    try {
      const response = await projectService.fetchProjects({ page: 1, pageSize: 100 });
      if (!requestGuard.isLatest(request, requestScope)) return;
      const data = (response.data?.data ?? []) as Project[];
      setProjects(data);
      setSelectedProjectId((current) => data.some((project) => project.id === current) ? current : data[0]?.id ?? "");
    } catch (loadError) {
      if (!requestGuard.isLatest(request, requestScope)) return;
      setProjects([]);
      setSelectedProjectId("");
      setError(getApiErrorMessage(loadError, "無法載入團隊資料。"));
    } finally {
      if (requestGuard.isLatest(request, requestScope)) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
    return () => {
      projectRequestGuardRef.current.invalidate();
      candidateRequestGuardRef.current.invalidate();
    };
  }, [loadProjects]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const members = useMemo(() => selectedProject?.members ?? [], [selectedProject]);
  const canManage = Boolean(selectedProject && selectedProject.status !== "archived" && canAccessProject(selectedProject, "admin"));

  const clearMemberCandidates = useCallback(() => {
    candidateRequestGuardRef.current.invalidate();
    setMemberCandidates([]);
    setCandidateLoading(false);
    setCandidateError("");
  }, []);

  const searchMemberCandidates = useCallback(async (query: string) => {
    if (!selectedProjectId || !canManage) {
      clearMemberCandidates();
      return;
    }

    const projectId = selectedProjectId;
    const normalizedQuery = query.trim();
    const requestScope = `${projectId}:${normalizedQuery.toLocaleLowerCase()}`;
    const requestGuard = candidateRequestGuardRef.current;
    const request = requestGuard.begin(requestScope);
    setCandidateLoading(true);
    setCandidateError("");
    try {
      const response = await projectService.fetchMemberCandidates(projectId, {
        q: normalizedQuery || undefined,
        limit: 20,
      });
      if (!requestGuard.isLatest(request, requestScope)) return;
      setMemberCandidates((response.data?.data ?? []) as MemberCandidate[]);
    } catch (searchError) {
      if (!requestGuard.isLatest(request, requestScope)) return;
      setMemberCandidates([]);
      setCandidateError(getApiErrorMessage(searchError, "無法搜尋可加入的帳號，請稍後再試。"));
    } finally {
      if (requestGuard.isLatest(request, requestScope)) setCandidateLoading(false);
    }
  }, [canManage, clearMemberCandidates, selectedProjectId]);

  const applyMember = useCallback((projectId: string, member: ProjectMember) => {
    setProjects((current) => current.map((project) => {
      if (project.id !== projectId) return project;
      const currentMembers = project.members ?? [];
      const exists = currentMembers.some((item) => item.userId === member.userId);
      return {
        ...project,
        members: exists
          ? currentMembers.map((item) => item.userId === member.userId ? { ...item, ...member } : item)
          : [...currentMembers, member],
      };
    }));
  }, []);

  const saveMember = useCallback(async (userId: string, role: ProjectMemberRole, isNew: boolean) => {
    if (!selectedProjectId || !userId.trim() || !canManage) return false;
    const normalizedUserId = userId.trim();
    const projectId = selectedProjectId;

    if (isNew) {
      if (addingMemberRef.current) return false;
      addingMemberRef.current = true;
      setAddingMember(true);
    } else {
      if (busyMemberIdsRef.current.has(normalizedUserId)) return false;
      busyMemberIdsRef.current.add(normalizedUserId);
      setBusyMemberIds([...busyMemberIdsRef.current]);
    }

    setError("");
    setAddError("");
    setAddErrorField("");
    setNotice("");
    try {
      const response = await projectService.upsertProjectMember(projectId, { userId: normalizedUserId, role });
      const member = response.data?.data as ProjectMember | undefined;
      applyMember(projectId, member ?? { projectId, userId: normalizedUserId, role, name: normalizedUserId, email: "" });
      if (isNew) setMemberCandidates((current) => current.filter((candidate) => candidate.id !== normalizedUserId));
      setNotice(isNew ? "成員已加入專案。" : "成員角色已更新。");
      return true;
    } catch (saveError) {
      if (isNew) {
        const presentation = presentTeamMemberError(saveError, "無法新增成員，請重新搜尋帳號並確認權限。");
        setAddError(presentation.message);
        setAddErrorField(presentation.field);
      } else {
        setError(getApiErrorMessage(saveError, "無法更新成員角色。"));
      }
      return false;
    } finally {
      if (isNew) {
        addingMemberRef.current = false;
        setAddingMember(false);
      } else {
        busyMemberIdsRef.current.delete(normalizedUserId);
        setBusyMemberIds([...busyMemberIdsRef.current]);
      }
    }
  }, [applyMember, canManage, selectedProjectId]);

  const selectProject = useCallback((projectId: string) => {
    candidateRequestGuardRef.current.invalidate();
    setSelectedProjectId(projectId);
    setError("");
    setAddError("");
    setAddErrorField("");
    setNotice("");
    setMemberCandidates([]);
    setCandidateLoading(false);
    setCandidateError("");
  }, []);
  const clearAddError = useCallback(() => {
    setAddError("");
    setAddErrorField("");
  }, []);
  const addMember = useCallback(
    (userId: string, role: ProjectMemberRole) => saveMember(userId, role, true),
    [saveMember],
  );
  const updateMemberRole = useCallback(
    (userId: string, role: ProjectMemberRole) => saveMember(userId, role, false),
    [saveMember],
  );

  return {
    projects,
    selectedProjectId,
    selectProject,
    selectedProject,
    members,
    canManage,
    loading,
    busyMemberIds,
    addingMember,
    error,
    addError,
    addErrorField,
    memberCandidates,
    candidateLoading,
    candidateError,
    notice,
    refresh: loadProjects,
    clearAddError,
    clearMemberCandidates,
    searchMemberCandidates,
    addMember,
    updateMemberRole,
  };
};
