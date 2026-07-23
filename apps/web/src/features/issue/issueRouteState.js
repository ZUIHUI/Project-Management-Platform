// @ts-check

export const ISSUE_QUERY_KEY = "issue";

/**
 * @param {string} projectId
 * @param {string} resolvedProjectId
 * @param {boolean} issuesLoading
 */
export const isIssueCollectionPending = (projectId, resolvedProjectId, issuesLoading) => (
  Boolean(projectId) && (issuesLoading || resolvedProjectId !== projectId)
);

/**
 * @param {URLSearchParams | string} currentSearch
 * @param {string} issueId
 */
export const withIssueSelection = (currentSearch, issueId) => {
  const nextSearch = new URLSearchParams(currentSearch);
  if (issueId) nextSearch.set(ISSUE_QUERY_KEY, issueId);
  else nextSearch.delete(ISSUE_QUERY_KEY);
  return nextSearch;
};

/**
 * @param {string} projectId
 * @param {"list" | "board"} viewMode
 * @param {string} issueId
 */
export const buildIssueViewHref = (projectId, viewMode, issueId = "") => {
  if (!projectId) return "/projects";
  const segment = viewMode === "board" ? "board" : "issues";
  const search = withIssueSelection("", issueId).toString();
  return `/projects/${encodeURIComponent(projectId)}/${segment}${search ? `?${search}` : ""}`;
};

/**
 * @param {string} linkedIssueId
 * @param {Array<{ id: string }>} issues
 * @param {boolean} issuesLoading
 * @returns {"none" | "pending" | "valid" | "invalid"}
 */
export const resolveLinkedIssueState = (linkedIssueId, issues, issuesLoading) => {
  if (!linkedIssueId) return "none";
  if (issuesLoading) return "pending";
  return issues.some((issue) => issue.id === linkedIssueId) ? "valid" : "invalid";
};
