import { useState, useEffect } from 'react';
import BoardView from '../components/BoardView';

export default function BoardPage() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: '設計首頁 UI',
      status: 'In Progress',
      priority: 'high',
      assignee: 'Alice',
      dueDate: new Date(),
    },
    {
      id: '2',
      title: 'API 開發',
      status: 'Todo',
      priority: 'medium',
      assignee: 'Bob',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  const statuses = ['Todo', 'In Progress', 'Done'];

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );
  };

  return (
    <BoardView
      projectId="current"
      tasks={tasks}
      statuses={statuses}
      onTaskClick={() => {}}
      onStatusChange={handleStatusChange}
    />
  );
}
