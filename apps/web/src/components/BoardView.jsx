import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const TaskCard = ({ task, onTaskClick }) => {
  const [, drag] = useDrag({
    type: 'TASK',
    item: task,
  });

  return (
    <div
      ref={drag}
      onClick={() => onTaskClick(task)}
      className="p-3 bg-white border rounded shadow-sm hover:shadow-md cursor-move transition-shadow mb-2"
    >
      <p className="text-sm font-medium text-gray-800">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>{task.priority || 'normal'}</span>
        {task.assignee && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {task.assignee}
          </span>
        )}
      </div>
      {task.dueDate && (
        <p className="text-xs text-gray-500 mt-1">
          截止: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const StatusColumn = ({ status, tasks, onTaskClick, onTaskMove }) => {
  const [, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => onTaskMove(item, status),
  });

  return (
    <div
      ref={drop}
      className="flex-1 bg-gray-50 rounded-lg p-4 min-h-96"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">{status}</h3>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
};

export default function BoardView({ projectId, tasks = [], statuses = ['Todo', 'In Progress', 'Done'], onTaskClick, onStatusChange }) {
  const [groupedTasks, setGroupedTasks] = useState({});

  useEffect(() => {
    const grouped = {};
    statuses.forEach(status => {
      grouped[status] = tasks.filter(t => t.status === status || (t.status_id && statuses[t.status_id] === status));
    });
    setGroupedTasks(grouped);
  }, [tasks, statuses]);

  const handleTaskMove = (task, newStatus) => {
    onStatusChange?.(task.id, newStatus);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-white rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">看板視圖 - {projectId}</h2>
          <p className="text-sm text-gray-600">拖放任務以改變狀態</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              tasks={groupedTasks[status] || []}
              onTaskClick={onTaskClick}
              onTaskMove={handleTaskMove}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
