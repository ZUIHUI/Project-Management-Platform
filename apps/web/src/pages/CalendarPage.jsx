import { useState } from 'react';
import CalendarView from '../components/CalendarView';

export default function CalendarPage() {
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
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  ]);

  return (
    <CalendarView
      tasks={tasks}
      onTaskClick={() => {}}
      onDateSelect={() => {}}
    />
  );
}
