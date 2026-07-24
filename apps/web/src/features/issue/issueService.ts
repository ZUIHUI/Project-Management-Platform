import { apiClient, apiRequest } from "../../shared/api/client";
import type { components } from "../../shared/api/schema";

export type IssuePayload = components["schemas"]["CreateIssueRequest"];
export type IssueUpdatePayload = components["schemas"]["UpdateIssueRequest"];
export type WorkflowStatus = components["schemas"]["WorkflowStatus"];
type IssueQuery = {
  q?: string;
  statusId?: string;
  assigneeId?: string;
  sortBy?: "number" | "updatedAt";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export const issueService = {
  fetchStatuses() {
    return apiRequest(apiClient.GET("/workflows/statuses"));
  },

  fetchIssuesByProject(projectId: string, query: IssueQuery = {}) {
    return apiRequest(
      apiClient.GET("/projects/{projectId}/issues", {
        params: { path: { projectId }, query },
      }),
    );
  },

  createIssue(projectId: string, data: IssuePayload) {
    return apiRequest(
      apiClient.POST("/projects/{projectId}/issues", {
        params: { path: { projectId } },
        body: data,
      }),
    );
  },

  updateIssue(id: string, data: IssueUpdatePayload) {
    return apiRequest(
      apiClient.PATCH("/issues/{issueId}", {
        params: { path: { issueId: id } },
        body: data,
      }),
    );
  },

  transitionIssueStatus(id: string, statusId: string) {
    return apiRequest(
      apiClient.PATCH("/issues/{issueId}/status", {
        params: { path: { issueId: id } },
        body: { statusId },
      }),
    );
  },

  assignIssue(id: string, assigneeId: string | null) {
    return apiRequest(
      apiClient.PATCH("/issues/{issueId}/assignee", {
        params: { path: { issueId: id } },
        body: { assigneeId },
      }),
    );
  },

  fetchIssueComments(id: string) {
    return apiRequest(apiClient.GET("/issues/{issueId}/comments", { params: { path: { issueId: id } } }));
  },

  createIssueComment(id: string, body: string, mentionedUserIds: string[] = []) {
    return apiRequest(
      apiClient.POST("/issues/{issueId}/comments", {
        params: { path: { issueId: id } },
        body: { body, mentionedUserIds },
      }),
    );
  },

  fetchIssueActivity(id: string, limit = 30) {
    return apiRequest(
      apiClient.GET("/issues/{issueId}/activity", {
        params: { path: { issueId: id }, query: { limit } },
      }),
    );
  },

  fetchActivityLogs() {
    return apiRequest(apiClient.GET("/activity-logs"));
  },
};
