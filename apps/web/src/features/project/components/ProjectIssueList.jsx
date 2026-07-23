import { ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, CardHeader, EmptyState } from "../../../components/ui";
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

export default function ProjectIssueList({ tasks, projectId, canEdit, onSelectTask }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Issue 清單" description={`共 ${tasks.length} 個工作項目`} />
      {tasks.length ? (
        <div className="divide-y divide-line-soft">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              className="flex min-h-20 w-full flex-col items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:flex-row sm:items-center sm:px-6"
            >
              <span className="min-w-0">
                <span className="font-mono text-xs font-medium text-muted">
                  #{task.number} · {getIssuePriorityPresentation(task.priority).label}
                </span>
                <span className="mt-1 line-clamp-2 text-sm font-semibold text-ink sm:block sm:truncate">
                  {task.title}
                </span>
                <span className="mt-1 block text-xs text-muted">{formatDate(task.dueDate)}</span>
              </span>
              <Badge tone={getWorkflowStatusTone(task.statusId)} className="shrink-0">
                {task.statusLabel ?? getWorkflowStatusLabel(task.statusId)}
              </Badge>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="目前沒有 Issue"
          description={canEdit ? "建立第一個 Issue，開始安排交付工作。" : "此專案尚未建立可顯示的工作項目。"}
          action={canEdit ? (
            <Button as={Link} to={`/projects/${projectId}/issues`}>建立 Issue</Button>
          ) : null}
        />
      )}
    </Card>
  );
}
