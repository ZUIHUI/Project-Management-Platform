import axiosInstance from "./axiosInstance";

export type IssuePayload = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  assigneeId?: string | null;
  reporterId?: string | null;
  dueDate?: string | null;
};

export const fetchIssuesByProject = (projectId: string) =>
  axiosInstance.get(`/projects/${projectId}/issues`);

export const fetchIssueById = (id: string) => axiosInstance.get(`/issues/${id}`);

export const createIssue = (projectId: string, data: IssuePayload) =>
  axiosInstance.post(`/projects/${projectId}/issues`, data, {
    headers: { "x-role": "member" },
  });

export const updateIssue = (id: string, data: Partial<IssuePayload>) =>
  axiosInstance.patch(`/issues/${id}`, data, {
    headers: { "x-role": "member" },
  });

export const transitionIssueStatus = (id: string, statusId: string) =>
  axiosInstance.patch(
    `/issues/${id}/status`,
    { statusId },
    {
      headers: { "x-role": "member" },
    },
  );
