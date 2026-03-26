import axiosInstance from "./axiosInstance";
import { projectService } from "../features/project/projectService";

export const fetchProjects = projectService.fetchProjects;
export const fetchProjectById = projectService.fetchProjectById;

export const createProject = (data: {
  key: string;
  name: string;
  description?: string;
  ownerId?: string;
}) =>
  axiosInstance.post("/projects", data, {
    headers: { "x-role": "project_admin" },
  });

export const updateProject = (id: string, data: Record<string, unknown>) =>
  axiosInstance.put(`/projects/${id}`, data, {
    headers: { "x-role": "project_admin" },
  });

export const archiveProject = (id: string) =>
  axiosInstance.post(
    `/projects/${id}/archive`,
    {},
    {
      headers: { "x-role": "project_admin" },
    },
  );

export const deleteProject = (id: string) =>
  axiosInstance.delete(`/projects/${id}`, {
    headers: { "x-role": "project_admin" },
  });

export const createMilestone = (projectId: string, data: { name: string; dueAt?: string }) =>
  axiosInstance.post(`/projects/${projectId}/milestones`, data, {
    headers: { "x-role": "member" },
  });

export const createSprint = (projectId: string, data: { name: string; goal?: string }) =>
  axiosInstance.post(`/projects/${projectId}/sprints`, data, {
    headers: { "x-role": "member" },
  });
