import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, EmptyState, IconButton } from "./ui";
import { cn } from "./ui/styles";

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const dateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function CalendarDay({ date, tasks, onDayClick, onTaskClick }) {
  const isToday = dateKey(new Date()) === dateKey(date);
  const dayClass = cn("inline-flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold", isToday ? "bg-brand text-white" : "text-body");
  return (
    <div className={cn("min-h-28 border-b border-r border-line-soft bg-canvas p-2", isToday && "bg-brand-soft")}>
      {onDayClick ? <button
        type="button"
        onClick={() => onDayClick(date)}
        className={cn(dayClass, "hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand")}
        aria-label={`${date.toLocaleDateString("zh-TW")}，${tasks.length} 個工作項目`}
      >
        {date.getDate()}
      </button> : <span className={dayClass} aria-label={isToday ? "今天" : undefined}>{date.getDate()}</span>}
      <div className="mt-2 space-y-1">
        {tasks.slice(0, 2).map((task) => {
          const content = <><span className="mr-1 font-mono text-muted">#{task.number}</span>{task.title}</>;
          const taskClass = "block min-h-11 w-full truncate rounded-control bg-surface-strong px-2 text-left text-[11px] font-medium text-ink";
          return onTaskClick ? <button key={task.id} type="button" onClick={() => onTaskClick(task)} title={task.title} className={`${taskClass} transition-colors hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}>{content}</button> : <div key={task.id} title={task.title} className={`${taskClass} flex items-center`}>{content}</div>;
        })}
        {tasks.length > 2 ? <p className="px-2 text-[11px] text-muted">另有 {tasks.length - 2} 項</p> : null}
      </div>
    </div>
  );
}

export default function CalendarView({ tasks = [], onTaskClick, onDateSelect, showHeader = true }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = useMemo(() => {
    const count = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const leading = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return [...Array(leading).fill(null), ...Array.from({ length: count }, (_, index) => new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1))];
  }, [currentDate]);
  const tasksByDate = useMemo(() => {
    const grouped = new Map();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = dateKey(new Date(task.dueDate));
      grouped.set(key, [...(grouped.get(key) ?? []), task]);
    });
    return grouped;
  }, [tasks]);
  const monthName = currentDate.toLocaleDateString("zh-TW", { month: "long", year: "numeric" });
  const navigation = (
    <div className="flex items-center gap-1">
      <IconButton label="上一個月" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}><ChevronLeft size={19} aria-hidden="true" /></IconButton>
      <span className="min-w-28 text-center text-sm font-semibold text-ink" aria-live="polite">{monthName}</span>
      <IconButton label="下一個月" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}><ChevronRight size={19} aria-hidden="true" /></IconButton>
    </div>
  );

  if (!tasks.length && !showHeader) return <Card><EmptyState icon={CalendarDays} title="目前沒有排定日期的工作" description="為 Issue 設定到期日後，就會顯示在行事曆上。" /></Card>;

  return (
    <Card className="overflow-hidden">
      {showHeader ? <CardHeader title="交付行事曆" description="以到期日查看每月工作安排。" action={navigation} /> : <div className="flex justify-end border-b border-line-soft px-4 py-2">{navigation}</div>}
      <div className="overflow-x-auto rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand" tabIndex="0" aria-label="行事曆，可水平捲動">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-7 border-b border-line-soft bg-surface">
            {weekdays.map((day) => <div key={day} className="py-3 text-center text-xs font-semibold text-muted">週{day}</div>)}
          </div>
          <div className="grid grid-cols-7 border-l border-line-soft">
            {days.map((date, index) => date ? (
              <CalendarDay key={date.toISOString()} date={date} tasks={tasksByDate.get(dateKey(date)) ?? []} onDayClick={onDateSelect} onTaskClick={onTaskClick} />
            ) : <div key={`blank-${index}`} className="min-h-28 border-b border-r border-line-soft bg-surface" aria-hidden="true" />)}
          </div>
        </div>
      </div>
    </Card>
  );
}
