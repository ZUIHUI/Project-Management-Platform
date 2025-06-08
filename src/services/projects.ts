import axiosInstance from "./axiosInstance";

// 取得所有專案
export const fetchProjects = () => axiosInstance.get("/projects");

// 取得單一專案
export const fetchProjectById = (id: string) => axiosInstance.get(`/projects/${id}`);

// 新增專案
export const createProject = (data: any) => axiosInstance.post("/projects", data);

// 更新專案
export const updateProject = (id: string, data: any) => axiosInstance.put(`/projects/${id}`, data);

// 刪除專案
export const deleteProject = (id: string) => axiosInstance.delete(`/projects/${id}`);

