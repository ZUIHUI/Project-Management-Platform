import { ArrowRight, ListChecks, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardHeader, EmptyState } from "../../../components/ui";
import {
  getIssuePriorityPresentation,
  getWorkflowStatusLabel,
  getWorkflowStatusTone,
} from "../../issue/workflowPresentation.js";

const formatDate = (value) => {
  if (!value) return "未設定到期日";
  return new Intl.DateTimeFormat("zh-TW", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default function DashboardIssueList({
  title,
  description,
  issues,
  risk = false,
  emptyTitle,
  emptyDescription,
  actionHref,
  actionLabel,
}) {
  const visibleIssues = issues.slice(0, 8);
  const listDescription = issues.length > visibleIssues.length
    ? `${description} 顯示前 ${visibleIssues.length} 筆，共 ${issues.length} 筆。`
    : description;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={title}
        description={listDescription}
        action={(
          <Link
            to={actionHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-sm font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {actionLabel}<ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      />

      {visibleIssues.length ? (
        <div className="divide-y divide-line-soft">
          {visibleIssues.map((issue) => (
            <Link
              key={issue.id}
              to={`/projects/${issue.projectId}/issues?issue=${encodeURIComponent(issue.id)}`}
              className="group flex min-h-20 flex-col items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:flex-row sm:items-center sm:px-6"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs font-medium text-muted">{issue.projectKey || issue.projectId} · #{issue.number}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink sm:truncate">{issue.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {issue.projectName} · {formatDate(issue.dueAt)} · {getIssuePriorityPresentation(issue.priority).label}
                </p>
              </div>
              <Badge
                tone={risk ? "danger" : getWorkflowStatusTone(issue.statusId)}
                className="shrink-0"
              >
                {risk ? "已逾期" : getWorkflowStatusLabel(issue.statusId)}
              </Badge>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          compact
          icon={risk ? TriangleAlert : ListChecks}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </Card>
  );
}
