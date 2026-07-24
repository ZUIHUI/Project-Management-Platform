import { apiClient, apiRequest } from "../../shared/api/client";
import type { components } from "../../shared/api/schema";

export type CreateProjectPayload = components["schemas"]["CreateProjectRequest"];
type ProjectQuery = { q?: string; status?: string; page?: number; pageSize?: number };
type MemberCandidateQuery = { q?: string; limit?: number };

export const projectService = {
  fetchProjects(query: ProjectQuery = {}) {
    return apiRequest(apiClient.GET("/projects", { params: { query } }));
  },

  fetchProjectById(id: string) {
    return apiRequest(apiClient.GET("/projects/{projectId}", { params: { path: { projectId: id } } }));
  },

  fetchProjectTimeline(id: string) {
    return apiRequest(apiClient.GET("/projects/{projectId}/timeline", { params: { path: { projectId: id } } }));
  },

  createProject(data: CreateProjectPayload) {
    return apiRequest(apiClient.POST("/projects", { body: data }));
  },

  archiveProject(id: string) {
    return apiRequest(apiClient.POST("/projects/{projectId}/archive", { params: { path: { projectId: id } } }));
  },

  fetchMemberCandidates(projectId: string, query: MemberCandidateQuery = {}) {
    return apiRequest(
      apiClient.GET("/projects/{projectId}/member-candidates", {
        params: { path: { projectId }, query },
      }),
    );
  },

  upsertProjectMember(projectId: string, data: { userId: string; role: "viewer" | "member" | "project_admin" }) {
    return apiRequest(
      apiClient.POST("/projects/{projectId}/members", {
        params: { path: { projectId } },
        body: data,
      }),
    );
  },

  createMilestone(projectId: string, data: { name: string; dueAt?: string }) {
    return apiRequest(
      apiClient.POST("/projects/{projectId}/milestones", {
        params: { path: { projectId } },
        body: data,
      }),
    );
  },

  createSprint(projectId: string, data: { name: string; goal?: string; startAt?: string; endAt?: string | null }) {
    return apiRequest(
      apiClient.POST("/projects/{projectId}/sprints", {
        params: { path: { projectId } },
        body: data,
      }),
    );
  },
};
