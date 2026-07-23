import { ChevronLeft, ChevronRight, ListChecks, Search } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState } from "../../../components/ui";
import { buttonClass, cn } from "../../../components/ui/styles";
import {
  getIssuePriorityPresentation,
  getWorkflowStatusLabel,
  getWorkflowStatusTone,
} from "../workflowPresentation.js";

export default function IssueList({
  issues,
  allIssueCount,
  statuses,
  selectedIssueId,
  canModify,
  onSelect,
  onMove,
  onCreate,
}) {
  const statusById = new Map(statuses.map((status) => [status.id, status]));

  return (
    <Card>
      <CardHeader title="Issue 清單" description={`${issues.length} 筆符合目前條件`} />
      {issues.length ? (
        <div className="divide-y divide-line-soft">
          {issues.map((issue) => {
            const currentStatus = statusById.get(issue.statusId);
            const currentStatusIndex = statuses.findIndex((status) => status.id === issue.statusId);
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

                {canModify ? (
                  <div className="flex shrink-0 justify-end gap-1" aria-label={`移動 Issue #${issue.number}`}>
                    <button
                      type="button"
                      aria-label={`將 Issue #${issue.number} 移至上一個狀態`}
                      disabled={currentStatusIndex <= 0}
                      onClick={() => onMove(issue.id, -1)}
                      className={buttonClass({ variant: "ghost", size: "sm", className: "h-11 min-h-11 w-11 px-0" })}
                    >
                      <ChevronLeft size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`將 Issue #${issue.number} 移至下一個狀態`}
                      disabled={currentStatusIndex < 0 || currentStatusIndex >= statuses.length - 1}
                      onClick={() => onMove(issue.id, 1)}
                      className={buttonClass({ variant: "ghost", size: "sm", className: "h-11 min-h-11 w-11 px-0" })}
                    >
                      <ChevronRight size={17} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
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
