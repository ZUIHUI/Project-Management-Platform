import axiosInstance from "./axiosInstance";

// 取得所有任務
export const fetchTasks = () => axiosInstance.get("/tasks");

// 取得單一任務
export const fetchTaskById = (id: string) => axiosInstance.get(`/tasks/${id}`);

// 新增任務
export const createTask = (data: any) => axiosInstance.post("/tasks", data);

// 更新任務
export const updateTask = (id: string, data: any) => axiosInstance.put(`/tasks/${id}`, data);

// 刪除任務
export const deleteTask = (id: string) => axiosInstance.delete(`/tasks/${id}`);