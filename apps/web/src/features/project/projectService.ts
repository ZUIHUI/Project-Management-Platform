import axiosInstance from "../../services/axiosInstance";

export const projectService = {
  fetchProjects(query?: Record<string, string | number | undefined>) {
    return axiosInstance.get("/projects", { params: query });
  },

  fetchProjectById(id: string) {
    return axiosInstance.get(`/projects/${id}`);
  },
};
