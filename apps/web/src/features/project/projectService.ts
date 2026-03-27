import axiosInstance from "../../services/axiosInstance";

export type CreateProjectPayload = {
  key: string;
  name: string;
  description?: string;
  ownerId?: string;
};

export const projectService = {
  fetchProjects(query?: Record<string, string | number | undefined>) {
    return axiosInstance.get("/projects", { params: query });
  },

  fetchProjectById(id: string) {
    return axiosInstance.get(`/projects/${id}`);
  },

  fetchProjectTimeline(id: string) {
    return axiosInstance.get(`/projects/${id}/timeline`);
  },

  createProject(data: CreateProjectPayload) {
    return axiosInstance.post("/projects", data, {
      headers: { "x-role": "project_admin" },
    });
  },

  archiveProject(id: string) {
    return axiosInstance.post(
      `/projects/${id}/archive`,
      {},
      {
        headers: { "x-role": "project_admin" },
      },
    );
  },

  createMilestone(projectId: string, data: { name: string; dueAt?: string }) {
    return axiosInstance.post(`/projects/${projectId}/milestones`, data, {
      headers: { "x-role": "member" },
    });
  },

  createSprint(projectId: string, data: { name: string; goal?: string }) {
    return axiosInstance.post(`/projects/${projectId}/sprints`, data, {
      headers: { "x-role": "member" },
    });
  },
};
