import axiosInstance from "../../services/axiosInstance";

export type IssuePayload = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  assigneeId?: string | null;
  reporterId?: string | null;
  dueAt?: string | null;
};

export type WorkflowStatus = {
  id: string;
  name: string;
  order: number;
};

export const issueService = {
  fetchStatuses() {
    return axiosInstance.get("/workflows/statuses");
  },

  fetchIssuesByProject(projectId: string, query?: Record<string, string | number | undefined>) {
    return axiosInstance.get(`/projects/${projectId}/issues`, { params: query });
  },

  createIssue(projectId: string, data: IssuePayload) {
    return axiosInstance.post(`/projects/${projectId}/issues`, data, {
      headers: { "x-role": "member" },
    });
  },

  transitionIssueStatus(id: string, statusId: string) {
    return axiosInstance.patch(
      `/issues/${id}/status`,
      { statusId },
      {
        headers: { "x-role": "member" },
      },
    );
  },

  assignIssue(id: string, assigneeId: string | null) {
    return axiosInstance.patch(
      `/issues/${id}/assignee`,
      { assigneeId },
      {
        headers: { "x-role": "member" },
      },
    );
  },

  fetchIssueComments(id: string) {
    return axiosInstance.get(`/issues/${id}/comments`);
  },

  createIssueComment(id: string, body: string) {
    return axiosInstance.post(
      `/issues/${id}/comments`,
      { body },
      {
        headers: { "x-role": "member" },
      },
    );
  },

  fetchIssueActivity(id: string, limit = 30) {
    return axiosInstance.get(`/issues/${id}/activity`, { params: { limit } });
  },
};
