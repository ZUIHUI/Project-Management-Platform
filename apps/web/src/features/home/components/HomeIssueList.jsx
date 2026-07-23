import { ArrowRight, ListChecks, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardHeader, EmptyState } from "../../../components/ui";
import {
  getIssuePriorityPresentation,
  getWorkflowStatusLabel,
  getWorkflowStatusTone,
} from "../../issue/workflowPresentation.js";

const formatDate = (value) => (
  value ? new Intl.DateTimeFormat("zh-TW", { month: "short", day: "numeric" }).format(new Date(value)) : "未設定到期日"
);

export default function HomeIssueList({
  title,
  description,
  issues,
  projectById,
  canOpenIssues,
  risk = false,
  emptyTitle,
  emptyDescription,
  actionHref,
  actionLabel,
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={title}
        description={description}
        action={actionHref ? (
          <Link
            to={actionHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-sm font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {actionLabel}<ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      />

      {issues.length ? (
        <div className="divide-y divide-line-soft">
          {issues.map((issue) => {
            const project = projectById.get(issue.projectId);
            const target = canOpenIssues
              ? `/projects/${issue.projectId}/issues?issue=${encodeURIComponent(issue.id)}`
              : `/projects/${issue.projectId}`;

            return (
              <Link
                key={issue.id}
                to={target}
                className="group flex min-h-20 items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted">
                    <span className="font-mono font-medium">{project?.key ?? issue.projectId} · #{issue.number}</span>
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">{issue.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {project?.name ?? "專案"} · {formatDate(issue.dueAt)} · {getIssuePriorityPresentation(issue.priority).label}
                  </p>
                </div>
                <Badge tone={risk ? "danger" : getWorkflowStatusTone(issue.statusId)} className="shrink-0">
                  {risk ? "已逾期" : getWorkflowStatusLabel(issue.statusId)}
                </Badge>
              </Link>
            );
          })}
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
