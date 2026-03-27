import { useState } from 'react';
import GanttView from '../components/GanttView';

export default function TimelinePage() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: '設計首頁 UI',
      status: 'In Progress',
      priority: 'high',
      assignee: 'Alice',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'API 開發',
      status: 'Todo',
      priority: 'medium',
      assignee: 'Bob',
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  ]);

  return (
    <GanttView
      tasks={tasks}
      onTaskClick={() => {}}
    />
  );
}
