import { useState } from 'react';
import InsightsComponent from '../pages/InsightsPage';

export default function InsightsPageWrapper() {
  const [tasks, setTasks] = useState([
    { id: '1', title: '設計 UI', status: 'Done', priority: 'high', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: '2', title: 'API 開發', status: 'In Progress', priority: 'high', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: '3', title: '測試', status: 'Todo', priority: 'medium', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: '4', title: '文件撰寫', status: 'Done', priority: 'low', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
    { id: '5', title: '部署', status: 'In Progress', priority: 'high', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
  ]);

  return (
    <InsightsComponent
      projectId="current"
      tasks={tasks}
    />
  );
}
