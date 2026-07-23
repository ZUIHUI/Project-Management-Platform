import { useMemo } from "react";
import { GanttChartSquare } from "lucide-react";
import { Card, CardHeader, EmptyState } from "./ui";
import { getWorkflowStatusTone } from "../features/issue/workflowPresentation.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const statusStyle = { success: "bg-ink", brand: "bg-brand", neutral: "bg-muted-soft" };

const asTime = (value, fallback) => {
  const time = new Date(value ?? fallback).getTime();
  return Number.isFinite(time) ? time : new Date(fallback).getTime();
};

export default function GanttView({ tasks = [], projectStartDate, projectEndDate, onTaskClick, showHeader = true }) {
  const sortedTasks = useMemo(
    () => [...tasks].sort((left, right) => asTime(left.dueDate, left.createdAt) - asTime(right.dueDate, right.createdAt)),
    [tasks],
  );
  const today = Date.now();
  const startTime = projectStartDate ? asTime(projectStartDate, today) : Math.min(...tasks.map((task) => asTime(task.createdAt, today)), today);
  const endTime = projectEndDate ? asTime(projectEndDate, today + 30 * DAY_MS) : Math.max(...tasks.map((task) => asTime(task.dueDate, today + 7 * DAY_MS)), today + 30 * DAY_MS);
  const totalDays = Math.max((endTime - startTime) / DAY_MS, 1);
  const formatDate = (value) => new Intl.DateTimeFormat("zh-TW", { month: "short", day: "numeric" }).format(new Date(value));

  return (
    <Card className="overflow-hidden">
      {showHeader ? <CardHeader title="交付時間軸" description={`${formatDate(startTime)} – ${formatDate(endTime)}，依到期日排列。`} /> : null}
      {!sortedTasks.length ? <EmptyState icon={GanttChartSquare} title="目前沒有可顯示的工作" description="建立 Issue 並設定到期日後，即可查看交付時間軸。" /> : (
        <div className="overflow-x-auto rounded-control p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:p-6" tabIndex="0" aria-label="交付時間軸，可水平捲動">
          <div className="min-w-[760px]">
            <div className="mb-4 grid grid-cols-[180px_minmax(460px,1fr)_72px] gap-4 border-b border-line-soft pb-3 text-xs font-semibold text-muted">
              <span>工作項目</span><span>{formatDate(startTime)} – {formatDate(endTime)}</span><span className="text-right">天數</span>
            </div>
            <div className="space-y-2">
              {sortedTasks.map((task) => {
                const taskStart = asTime(task.startDate, task.createdAt ?? startTime);
                const taskEnd = Math.max(asTime(task.dueDate, today), taskStart + DAY_MS);
                const offset = Math.max(0, Math.min(((taskStart - startTime) / DAY_MS / totalDays) * 100, 96));
                const width = Math.max(3, Math.min(((taskEnd - taskStart) / DAY_MS / totalDays) * 100, 100 - offset));
                const days = Math.max(1, Math.ceil((taskEnd - taskStart) / DAY_MS));
                const label = <><span className="mr-2 font-mono text-xs text-muted">#{task.number}</span>{task.title}</>;
                const barClass = `${statusStyle[getWorkflowStatusTone(task.statusId)] ?? statusStyle.neutral} absolute inset-y-0 min-w-11 rounded-pill px-2 text-left text-[11px] font-semibold text-white`;
                const barStyle = { left: `${offset}%`, width: `${width}%` };
                return (
                  <div key={task.id} className="grid min-h-12 grid-cols-[180px_minmax(460px,1fr)_72px] items-center gap-4 rounded-control px-2 transition-colors hover:bg-surface">
                    {onTaskClick ? <button type="button" onClick={() => onTaskClick(task)} className="flex min-h-11 items-center truncate text-left text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{label}</button> : <div className="flex min-h-11 items-center truncate text-sm font-semibold text-ink">{label}</div>}
                    <div className="relative h-11 rounded-pill bg-surface-strong">
                      {onTaskClick ? <button
                        type="button"
                        onClick={() => onTaskClick(task)}
                        aria-label={`${task.title}，${days} 天`}
                        className={`${barClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2`}
                        style={barStyle}
                      >
                        <span className="block truncate">{width > 16 ? task.title : ""}</span>
                      </button> : <div className={barClass} style={barStyle} aria-label={`${task.title}，${days} 天`}><span className="block truncate leading-[44px]">{width > 16 ? task.title : ""}</span></div>}
                    </div>
                    <span className="text-right font-mono text-xs text-body">{days}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
