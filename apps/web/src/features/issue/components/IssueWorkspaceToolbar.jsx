import { Columns3, List, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card, FormField } from "../../../components/ui";
import { cn, inputClass } from "../../../components/ui/styles";

export default function IssueWorkspaceToolbar({
  projects,
  projectId,
  selectedProject,
  viewMode,
  listHref,
  boardHref,
  keyword,
  issueCount,
  filteredCount,
  onProjectChange,
  onKeywordChange,
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 border-b border-line-soft pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">工作範圍</p>
          <p className="mt-1 text-xs text-muted">切換專案或檢視方式，不離開目前工作流程。</p>
        </div>
        <nav aria-label="Issue 檢視模式" className="grid w-full grid-cols-2 gap-1 rounded-pill bg-surface-strong p-1 sm:w-auto xl:flex">
          <Button
            as={Link}
            to={listHref}
            variant={viewMode === "list" ? "outline" : "ghost"}
            size="sm"
            aria-current={viewMode === "list" ? "page" : undefined}
            className={cn("min-w-0 px-4", viewMode === "list" && "shadow-soft")}
          >
            <List size={16} aria-hidden="true" />清單
          </Button>
          <Button
            as={Link}
            to={boardHref}
            variant={viewMode === "board" ? "outline" : "ghost"}
            size="sm"
            aria-current={viewMode === "board" ? "page" : undefined}
            className={cn("min-w-0 px-4", viewMode === "board" && "shadow-soft")}
          >
            <Columns3 size={16} aria-hidden="true" />看板
          </Button>
        </nav>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-end">
        <FormField label="目前專案" htmlFor="issue-project">
          <select
            id="issue-project"
            className={inputClass}
            value={projectId}
            onChange={(event) => onProjectChange(event.target.value)}
          >
            {!projects.length ? <option value="">目前沒有可用專案</option> : null}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.key} — {project.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="搜尋 Issue" htmlFor="issue-search" hint={`${filteredCount} / ${issueCount} 筆`}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
            <input
              id="issue-search"
              className={cn(inputClass, "pl-11")}
              type="search"
              placeholder="搜尋編號、標題或描述"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
            />
          </div>
        </FormField>
      </div>

      {selectedProject?.description ? (
        <p className="mt-4 border-t border-line-soft pt-4 text-sm leading-6 text-body">{selectedProject.description}</p>
      ) : null}
    </Card>
  );
}
