import { useState } from 'react';
import BoardView from '../components/BoardView';
import CalendarView from '../components/CalendarView';
import GanttView from '../components/GanttView';
import TaskDetailPanel from '../components/TaskDetailPanel';

export default function ProjectDetailDashboard({ projectId = 'PROJECT-001' }) {
  const [selectedView, setSelectedView] = useState('board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([
    {
      id: '1',
      number: '1',
      title: '設計首頁 UI',
      description: '為新平台設計首頁用戶界面',
      status: 'In Progress',
      priority: 'high',
      assignee: 'Alice',
      dueDate: new Date(2026, 3, 15),
      createdAt: new Date(2026, 2, 1),
      updatedAt: new Date(2026, 3, 5),
      tags: ['design', 'ui'],
      comments: [
        {
          id: 'c1',
          author: 'Bob',
          body: '看起來不錯，可以加一些動畫效果嗎？',
          createdAt: new Date(2026, 3, 4),
        },
      ],
    },
    {
      id: '2',
      number: '2',
      title: 'API 文件撰寫',
      description: '撰寫完整的 API 文件',
      status: 'Todo',
      priority: 'medium',
      assignee: 'Charlie',
      dueDate: new Date(2026, 3, 20),
      createdAt: new Date(2026, 2, 5),
      updatedAt: new Date(2026, 3, 3),
      tags: ['documentation', 'api'],
    },
    {
      id: '3',
      number: '3',
      title: '數據庫優化',
      description: '優化數據庫查詢效能',
      status: 'Done',
      priority: 'high',
      assignee: 'David',
      dueDate: new Date(2026, 3, 10),
      createdAt: new Date(2026, 2, 10),
      updatedAt: new Date(2026, 3, 8),
      tags: ['performance', 'backend'],
    },
    {
      id: '4',
      number: '4',
      title: '前端測試套件建立',
      description: '為前端建立自動化測試',
      status: 'In Progress',
      priority: 'medium',
      assignee: 'Eve',
      dueDate: new Date(2026, 3, 25),
      createdAt: new Date(2026, 2, 15),
      updatedAt: new Date(2026, 3, 6),
      tags: ['testing', 'frontend'],
    },
    {
      id: '5',
      number: '5',
      title: '使用者驗證系統',
      description: '實現 JWT 認證和授權',
      status: 'Todo',
      priority: 'high',
      assignee: null,
      dueDate: new Date(2026, 4, 1),
      createdAt: new Date(2026, 2, 20),
      updatedAt: new Date(2026, 3, 2),
      tags: ['security', 'auth'],
    },
  ]);

  const team = [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
    { id: 'charlie', name: 'Charlie' },
    { id: 'david', name: 'David' },
    { id: 'eve', name: 'Eve' },
  ];

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const statuses = ['Todo', 'In Progress', 'Done'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">專案詳情 - {projectId}</h1>
          <p className="text-sm text-gray-600 mt-1">使用不同視圖管理任務</p>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded-lg w-fit">
        {[
          { id: 'board', label: '看板' },
          { id: 'calendar', label: '日曆' },
          { id: 'gantt', label: 'Gantt' },
          { id: 'list', label: '清單' },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id)}
            className={`px-4 py-2 rounded transition-colors ${
              selectedView === view.id
                ? 'bg-blue-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-gray-200'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {selectedView === 'board' && (
        <BoardView
          projectId={projectId}
          tasks={tasks}
          statuses={statuses}
          onTaskClick={setSelectedTask}
          onStatusChange={handleStatusChange}
        />
      )}

      {selectedView === 'calendar' && (
        <CalendarView
          tasks={tasks}
          onTaskClick={setSelectedTask}
          onDateSelect={(date) => console.log('Selected date:', date)}
        />
      )}

      {selectedView === 'gantt' && (
        <GanttView
          tasks={tasks}
          projectStartDate={new Date(2026, 1, 1)}
          projectEndDate={new Date(2026, 4, 31)}
          onTaskClick={setSelectedTask}
        />
      )}

      {selectedView === 'list' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">任務清單</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">#{task.number} {task.title}</p>
                  <p className="text-sm text-gray-500">{task.assignee || '未指派'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  task.status === 'Done' ? 'bg-green-100 text-green-800' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          team={team}
        />
      )}
    </div>
  );
}
