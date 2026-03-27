import { useState } from 'react';
import WorkloadView from '../components/WorkloadView';

export default function WorkloadPage() {
  const [tasks, setTasks] = useState([
    { id: '1', title: '設計 UI', assignee: 'alice', status: 'In Progress' },
    { id: '2', title: 'API 開發', assignee: 'bob', status: 'Todo' },
    { id: '3', title: '測試', assignee: 'alice', status: 'Done' },
    { id: '4', title: '文件撰寫', assignee: 'charlie', status: 'In Progress' },
  ]);

  const [team, setTeam] = useState([
    { id: 'alice', name: 'Alice', email: 'alice@example.com' },
    { id: 'bob', name: 'Bob', email: 'bob@example.com' },
    { id: 'charlie', name: 'Charlie', email: 'charlie@example.com' },
  ]);

  return (
    <WorkloadView
      tasks={tasks}
      team={team}
    />
  );
}
