import { useState, useMemo } from 'react';

const GanttBar = ({ task, startDate, endDate, onTaskClick }) => {
  const projectStart = new Date(startDate);
  const projectEnd = new Date(endDate);
  const taskStart = new Date(task.startDate || task.createdAt);
  const taskEnd = new Date(task.dueDate || new Date());

  const totalDays = Math.max(1, (projectEnd - projectStart) / (1000 * 60 * 60 * 24));
  const offsetDays = Math.max(0, (taskStart - projectStart) / (1000 * 60 * 60 * 24));
  const durationDays = (taskEnd - taskStart) / (1000 * 60 * 60 * 24);

  const offsetPercent = (offsetDays / totalDays) * 100;
  const widthPercent = Math.max(2, (durationDays / totalDays) * 100);

  const statusColor = task.status === 'Done' ? 'bg-green-500' :
    task.status === 'In Progress' ? 'bg-blue-500' :
    'bg-gray-400';

  return (
    <div className="flex items-center mb-3">
      <div className="w-40 text-sm font-medium text-gray-700 truncate pr-2">
        {task.title}
      </div>
      <div className="flex-1 relative bg-gray-100 rounded h-6">
        <div
          style={{
            marginLeft: `${offsetPercent}%`,
            width: `${widthPercent}%`,
          }}
          onClick={() => onTaskClick(task)}
          className={`${statusColor} h-full rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2`}
        >
          {widthPercent > 20 && (
            <span className="text-xs text-white font-semibold truncate">
              {task.title}
            </span>
          )}
        </div>
      </div>
      <div className="w-20 text-right text-xs text-gray-500 pl-2">
        {Math.round(durationDays)} days
      </div>
    </div>
  );
};

export default function GanttView({ tasks = [], projectStartDate, projectEndDate, onTaskClick }) {
  const [hoveredTask, setHoveredTask] = useState(null);

  const startDate = projectStartDate || (tasks.length > 0 ? new Date(Math.min(...tasks.map(t => new Date(t.createdAt)))) : new Date());
  const endDate = projectEndDate || (tasks.length > 0 ? new Date(Math.max(...tasks.map(t => new Date(t.dueDate || new Date())))) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDate = new Date(a.dueDate || a.createdAt);
      const bDate = new Date(b.dueDate || b.createdAt);
      return aDate - bDate;
    });
  }, [tasks]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 bg-white rounded-lg overflow-x-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Gantt 甘特圖</h2>
        <div className="flex gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span>已完成</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span>進行中</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-400 rounded"></div>
            <span>未開始</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="w-40 text-sm font-semibold text-gray-700">任務名稱</div>
        <div className="flex-1 text-sm font-semibold text-gray-700">
          {formatDate(startDate)} - {formatDate(endDate)}
        </div>
      </div>

      <div className="space-y-1">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            onMouseEnter={() => setHoveredTask(task.id)}
            onMouseLeave={() => setHoveredTask(null)}
            className={hoveredTask === task.id ? 'bg-blue-50 rounded px-2 py-1' : 'px-2 py-1'}
          >
            <GanttBar
              task={task}
              startDate={startDate}
              endDate={endDate}
              onTaskClick={onTaskClick}
            />
          </div>
        ))}
      </div>

      {sortedTasks.length === 0 && (
        <p className="text-center text-gray-500 py-8">暫無任務</p>
      )}
    </div>
  );
}
