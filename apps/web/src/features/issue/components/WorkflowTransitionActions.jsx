import { ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui";
import { cn } from "../../../components/ui/styles";
import { getWorkflowStatusLabel, getWorkflowTransitionTargets } from "../workflowPresentation.js";

export default function WorkflowTransitionActions({
  issue,
  statuses,
  canModify,
  pending = false,
  onTransition,
  compact = false,
  className,
}) {
  if (!issue || !canModify || typeof onTransition !== "function") return null;

  const targets = getWorkflowTransitionTargets(statuses, issue.statusId);

  return (
    <fieldset
      className={cn(
        "rounded-control border border-line-soft bg-surface p-3",
        compact && "min-w-56 bg-transparent",
        className,
      )}
      disabled={pending}
      aria-busy={pending || undefined}
    >
      <legend className="px-1 text-xs font-semibold text-muted">可用下一步</legend>
      {pending ? (
        <p className="text-xs font-semibold text-brand" role="status">狀態更新中…</p>
      ) : targets.length ? (
        <div className="flex flex-wrap gap-2">
          {targets.map((target) => (
            <Button
              key={target.id}
              type="button"
              size="sm"
              variant="outline"
              className="min-h-11"
              onClick={() => onTransition(issue.id, target.id)}
            >
              移至「{target.label ?? getWorkflowStatusLabel(target)}」
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">目前沒有可用的狀態轉換。</p>
      )}
    </fieldset>
  );
}
