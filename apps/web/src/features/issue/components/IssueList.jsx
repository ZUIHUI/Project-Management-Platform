import { ListChecks, Search } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState } from "../../../components/ui";
import { cn } from "../../../components/ui/styles";
import {
  getIssuePriorityPresentation,
  getWorkflowStatusLabel,
  getWorkflowStatusTone,
} from "../workflowPresentation.js";
import WorkflowTransitionActions from "./WorkflowTransitionActions";

export default function IssueList({
  issues,
  allIssueCount,
  statuses,
  selectedIssueId,
  canModify,
  onSelect,
  onTransition,
  transitioningIssueIds = [],
  onCreate,
}) {
  const statusById = new Map(statuses.map((status) => [status.id, status]));
  const transitioningIssues = new Set(transitioningIssueIds);

  return (
    <Card>
      <CardHeader title="Issue 清單" description={`${issues.length} 筆符合目前條件`} />
      {issues.length ? (
        <div className="divide-y divide-line-soft">
          {issues.map((issue) => {
            const currentStatus = statusById.get(issue.statusId);
            const priority = getIssuePriorityPresentation(issue.priority);

            return (
              <article
                key={issue.id}
                className={cn(
                  "flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6",
                  selectedIssueId === issue.id ? "bg-brand-soft" : "hover:bg-surface",
                )}
              >
                <button
                  type="button"
                  className="min-h-11 min-w-0 flex-1 rounded-control text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  onClick={() => onSelect(issue.id)}
                  aria-pressed={selectedIssueId === issue.id}
                >
                  <span className="font-mono text-xs font-medium text-muted">#{issue.number}</span>
                  <span className="mt-1 block truncate font-semibold text-ink">{issue.title}</span>
                  <span className="mt-2 flex flex-wrap gap-2">
                    <Badge tone={getWorkflowStatusTone(currentStatus ?? issue.statusId, statuses)}>{getWorkflowStatusLabel(currentStatus ?? issue.statusId)}</Badge>
                    <Badge tone={priority.tone}>{priority.label}</Badge>
                  </span>
                </button>

                <WorkflowTransitionActions
                  issue={issue}
                  statuses={statuses}
                  canModify={canModify}
                  pending={transitioningIssues.has(issue.id)}
                  onTransition={onTransition}
                  compact
                  className="shrink-0 sm:max-w-72"
                />
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={allIssueCount ? Search : ListChecks}
          title={allIssueCount ? "找不到符合的 Issue" : "尚未建立 Issue"}
          description={allIssueCount ? "調整搜尋關鍵字後再試一次。" : "建立第一個 Issue，開始追蹤交付工作。"}
          action={!allIssueCount && canModify ? <Button onClick={onCreate}>建立 Issue</Button> : null}
        />
      )}
    </Card>
  );
}
