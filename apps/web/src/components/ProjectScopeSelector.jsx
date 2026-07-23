import { FolderKanban, RefreshCw } from "lucide-react";
import { Alert, Button, Card } from "./ui";
import { inputClass } from "./ui/styles";

export default function ProjectScopeSelector({ projects = [], value, onChange, loading, error, readOnlyMessage, onRetry }) {
  return (
    <div className="space-y-3">
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong text-ink">
            <FolderKanban size={18} aria-hidden="true" />
          </span>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="project-scope">專案範圍</label>
            <p className="text-xs text-muted">切換目前要檢視的專案。</p>
          </div>
        </div>
        <select
          id="project-scope"
          className={`${inputClass} min-h-11 w-full py-0 text-sm sm:w-72`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading || projects.length === 0}
        >
          {projects.length === 0 ? <option value="">沒有可用專案</option> : null}
          {projects.map((project) => <option key={project.id} value={project.id}>{project.key} · {project.name}</option>)}
        </select>
      </Card>
      {error ? (
        <Alert tone="error" title="無法載入專案工作區">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            {onRetry ? (
              <Button variant="secondary" className="w-full shrink-0 sm:w-auto" onClick={onRetry}>
                <RefreshCw size={16} aria-hidden="true" />重新載入
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : null}
      {!error && readOnlyMessage ? <Alert tone="info" title="唯讀模式">{readOnlyMessage}</Alert> : null}
    </div>
  );
}
