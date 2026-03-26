import { issueService } from "../features/issue/issueService";

export type IssuePayload = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  assigneeId?: string | null;
  reporterId?: string | null;
  dueAt?: string | null;
};

export const fetchIssuesByProject = issueService.fetchIssuesByProject;
export const createIssue = issueService.createIssue;
export const transitionIssueStatus = issueService.transitionIssueStatus;
export const fetchWorkflowStatuses = issueService.fetchStatuses;
