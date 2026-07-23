import { Search } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState, FormField } from "../../../components/ui";
import { cn, inputClass } from "../../../components/ui/styles";

const statusLabel = (project) => project.status === "archived" ? "已封存" : "進行中";

export default function ProjectNavigator({
  projects,
  filteredProjects,
  selectedProjectId,
  onSelectProject,
  keyword,
  onKeywordChange,
  activeCount,
}) {
  return (
    <Card className="h-fit overflow-hidden lg:sticky lg:top-6">
      <CardHeader
        title={`全部專案 · ${projects.length}`}
        description={`${activeCount} 個進行中`}
      />

      <div className="p-5 lg:hidden">
        <FormField label="目前專案" htmlFor="mobile-project-select" hint="切換後，下方會顯示所選專案的交付概況。">
          <select
            id="mobile-project-select"
            className={inputClass}
            value={selectedProjectId}
            onChange={(event) => onSelectProject(event.target.value)}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.key} · {project.name}{project.status === "archived" ? "（已封存）" : ""}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="hidden lg:block">
        <div className="border-b border-line-soft p-4">
          <label className="relative block">
            <span className="sr-only">搜尋專案</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} aria-hidden="true" />
            <input
              type="search"
              className="h-11 w-full rounded-pill border-0 bg-surface-strong pl-10 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-brand"
              value={keyword}
              placeholder="搜尋代碼、名稱或說明"
              onChange={(event) => onKeywordChange(event.target.value)}
            />
          </label>
        </div>

        {filteredProjects.length ? (
          <ul className="max-h-[calc(100vh-18rem)] min-h-56 overflow-y-auto p-2" aria-label="專案清單">
            {filteredProjects.map((project) => {
            const selected = project.id === selectedProjectId;
            return (
              <li key={project.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    "flex min-h-20 w-full items-center gap-3 rounded-card px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    selected ? "bg-brand-soft" : "hover:bg-surface",
                  )}
                >
                  <span className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium",
                    selected ? "bg-brand text-white" : "bg-surface-strong text-ink",
                  )}>
                    {project.key.slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{project.name}</span>
                    <span className="mt-1 block truncate font-mono text-xs text-muted">{project.key}</span>
                  </span>
                  <Badge tone={project.status === "archived" ? "neutral" : "success"}>{statusLabel(project)}</Badge>
                </button>
              </li>
            );
            })}
          </ul>
        ) : (
          <EmptyState compact title="找不到符合的專案" description="請調整搜尋關鍵字。" />
        )}
      </div>
    </Card>
  );
}
