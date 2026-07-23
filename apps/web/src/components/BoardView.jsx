import { useMemo } from "react";
import { CalendarClock, GripVertical, Inbox } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Badge, Card, CardHeader, EmptyState } from "./ui";
import { cn } from "./ui/styles";
import {
  DEFAULT_WORKFLOW_STATUS_OPTIONS,
  getIssuePriorityPresentation,
} from "../features/issue/workflowPresentation.js";

const formatDate = (value) => new Intl.DateTimeFormat("zh-TW", { month: "short", day: "numeric" }).format(new Date(value));

function TaskCard({ task, statuses, selected, onTaskClick, onTaskMove }) {
  const [{ dragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id, statusId: task.statusId },
    canDrag: Boolean(onTaskMove),
    collect: (monitor) => ({ dragging: monitor.isDragging() }),
  });
  const priority = getIssuePriorityPresentation(task.priority);

  return (
    <article
      ref={drag}
      className={cn(
        "rounded-card border bg-canvas p-4 transition-shadow hover:shadow-soft",
        selected ? "border-brand shadow-soft" : "border-line",
        dragging && "opacity-50",
      )}
    >
      <div className="flex items-start gap-3">
        {onTaskMove ? <GripVertical className="mt-0.5 shrink-0 cursor-grab text-muted" size={18} aria-hidden="true" /> : null}
        {onTaskClick ? <button type="button" onClick={() => onTaskClick(task)} aria-pressed={selected} className="min-h-11 min-w-0 flex-1 rounded-control text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <p className="text-xs font-mono text-muted">#{task.number}</p>
          <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-ink">{task.title}</h4>
        </button> : <div className="min-w-0 flex-1"><p className="text-xs font-mono text-muted">#{task.number}</p><h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-ink">{task.title}</h4></div>}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={priority.tone}>{priority.label}</Badge>
        {task.assignee ? <Badge>{task.assigneeLabel ?? task.assignee}</Badge> : <span className="text-xs text-muted">未指派</span>}
      </div>
      {task.dueDate ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><CalendarClock size={14} aria-hidden="true" />{formatDate(task.dueDate)}</p>
      ) : null}
      {onTaskMove ? <label className="mt-4 block border-t border-line-soft pt-3 text-xs text-muted">
        <span className="sr-only">移動「{task.title}」到其他狀態</span>
        <select
          aria-label={`移動「${task.title}」到其他狀態`}
          value={task.statusId}
          onChange={(event) => onTaskMove(task, event.target.value)}
          className="min-h-11 w-full rounded-control border border-line bg-canvas px-3 text-xs font-semibold text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        >
          {statuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
        </select>
      </label> : null}
    </article>
  );
}

function StatusColumn({ status, tasks, statuses, selectedTaskId, onTaskClick, onTaskMove }) {
  const headingId = `board-${encodeURIComponent(status.id)}`;
  const [{ over }, drop] = useDrop({
    accept: "TASK",
    canDrop: () => Boolean(onTaskMove),
    drop: (item) => {
      if (item.statusId !== status.id) onTaskMove?.(item, status.id);
    },
    collect: (monitor) => ({ over: monitor.isOver() }),
  });

  return (
    <section ref={drop} aria-labelledby={headingId} className={cn("w-[300px] shrink-0 rounded-card border border-line-soft bg-surface p-3 sm:w-[320px]", over && "border-brand bg-brand-soft")}>
      <div className="flex min-h-11 items-center justify-between px-2">
        <h3 id={headingId} className="text-sm font-semibold text-ink">{status.label}</h3>
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-surface-strong px-2 font-mono text-xs text-body">{tasks.length}</span>
      </div>
      <div className="mt-2 space-y-3">
        {tasks.map((task) => <TaskCard key={task.id} task={task} statuses={statuses} selected={selectedTaskId === task.id} onTaskClick={onTaskClick} onTaskMove={onTaskMove} />)}
        {!tasks.length ? <EmptyState compact icon={Inbox} title="此欄目前沒有工作" /> : null}
      </div>
    </section>
  );
}

export default function BoardView({ projectId, tasks = [], statusOptions = DEFAULT_WORKFLOW_STATUS_OPTIONS, selectedTaskId, onTaskClick, onStatusChange, showHeader = true }) {
  const groupedTasks = useMemo(
    () => Object.fromEntries(statusOptions.map((status) => [status.id, tasks.filter((task) => task.statusId === status.id)])),
    [statusOptions, tasks],
  );
  const handleTaskMove = onStatusChange ? (task, newStatus) => onStatusChange(task.id, newStatus) : undefined;

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="overflow-hidden">
        {showHeader ? <CardHeader title={`工作看板${projectId ? ` · ${projectId}` : ""}`} description={onStatusChange ? "拖曳卡片或使用卡片下方選單調整工作狀態。" : "以欄位檢視工作狀態；目前為唯讀模式。"} /> : null}
        <div className="overflow-x-auto rounded-control p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:p-5" tabIndex="0" aria-label="工作看板，可水平捲動">
          <div className="flex min-w-max gap-4">
            {statusOptions.map((status) => <StatusColumn key={status.id} status={status} statuses={statusOptions} tasks={groupedTasks[status.id] ?? []} selectedTaskId={selectedTaskId} onTaskClick={onTaskClick} onTaskMove={handleTaskMove} />)}
          </div>
        </div>
      </Card>
    </DndProvider>
  );
}
