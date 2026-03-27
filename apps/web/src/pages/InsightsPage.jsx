import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

const StatCard = ({ title, value, subtitle, color = 'blue' }) => {
  const bgColor = color === 'blue' ? 'bg-blue-50' :
    color === 'green' ? 'bg-green-50' :
    color === 'red' ? 'bg-red-50' :
    color === 'yellow' ? 'bg-yellow-50' :
    'bg-gray-50';

  const textColor = color === 'blue' ? 'text-blue-600' :
    color === 'green' ? 'text-green-600' :
    color === 'red' ? 'text-red-600' :
    color === 'yellow' ? 'text-yellow-600' :
    'text-gray-600';

  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

const ChartBar = ({ label, value, max, color = 'bg-blue-500' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function InsightsPage({ projectId = null, tasks = [] }) {
  const { projectId: routeProjectId } = useParams();
  const finalProjectId = projectId || routeProjectId || 'current';
  const statistics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const todo = tasks.filter(t => t.status === 'Todo').length;
    const overdue = tasks.filter(t => {
      const due = new Date(t.dueDate);
      return due < new Date() && t.status !== 'Done';
    }).length;

    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overallHealth = 100 - (overdue / Math.max(total, 1)) * 20; // Simplified health score

    // Task duration analysis
    const createdDates = tasks.map(t => new Date(t.createdAt).getTime());
    const completedDates = tasks.filter(t => t.status === 'Done').map(t => new Date(t.updatedAt).getTime());

    let avgCompletionTime = 0;
    if (completedDates.length > 0) {
      const totalTime = createdDates.slice(0, completedDates.length)
        .reduce((sum, created, idx) => sum + (completedDates[idx] - created), 0);
      avgCompletionTime = Math.round(totalTime / completedDates.length / (1000 * 60 * 60 * 24)); // days
    }

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
      overallHealth,
      avgCompletionTime,
    };
  }, [tasks]);

  const teamProductivity = useMemo(() => {
    const assigneeStats = {};
    tasks.forEach(task => {
      if (task.assignee) {
        if (!assigneeStats[task.assignee]) {
          assigneeStats[task.assignee] = { total: 0, completed: 0 };
        }
        assigneeStats[task.assignee].total++;
        if (task.status === 'Done') {
          assigneeStats[task.assignee].completed++;
        }
      }
    });

    return Object.entries(assigneeStats).map(([name, stats]) => ({
      name,
      ...stats,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    })).sort((a, b) => b.completionRate - a.completionRate);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">洞察和分析</h2>
        <p className="text-sm text-gray-600">專案執行情況和團隊效能分析</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="整體健康度"
          value={Math.round(statistics.overallHealth)}
          subtitle="基於進度和逾期任務"
          color="blue"
        />
        <StatCard
          title="完成率"
          value={`${statistics.completionRate}%`}
          subtitle={`${statistics.completed}/${statistics.total} 任務`}
          color="green"
        />
        <StatCard
          title="逾期任務"
          value={statistics.overdue}
          subtitle="暫未完成"
          color={statistics.overdue > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="平均完成時間"
          value={`${statistics.avgCompletionTime}天`}
          subtitle="已完成任務"
          color="yellow"
        />
      </div>

      {/* Status Breakdown */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">任務狀態分布</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">{statistics.todo}</p>
              <p className="text-sm text-gray-600 mt-1">待辦</p>
            </div>
          </div>
          <div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{statistics.inProgress}</p>
              <p className="text-sm text-gray-600 mt-1">進行中</p>
            </div>
          </div>
          <div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{statistics.completed}</p>
              <p className="text-sm text-gray-600 mt-1">已完成</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">優先級分布</h3>
        <ChartBar
          label="高優先級"
          value={statistics.highPriority}
          max={Math.max(statistics.highPriority, statistics.mediumPriority, statistics.lowPriority, 1)}
          color="bg-red-500"
        />
        <ChartBar
          label="中優先級"
          value={statistics.mediumPriority}
          max={Math.max(statistics.highPriority, statistics.mediumPriority, statistics.lowPriority, 1)}
          color="bg-yellow-500"
        />
        <ChartBar
          label="低優先級"
          value={statistics.lowPriority}
          max={Math.max(statistics.highPriority, statistics.mediumPriority, statistics.lowPriority, 1)}
          color="bg-green-500"
        />
      </div>

      {/* Team Productivity */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">團隊生產力</h3>
        {teamProductivity.length === 0 ? (
          <p className="text-center text-gray-500 py-4">暫無任務分配</p>
        ) : (
          <div className="space-y-4">
            {teamProductivity.map((member, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.completed} / {member.total} 完成</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    member.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                    member.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {member.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${member.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trends */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">關鍵指標</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600">平均任務周期</p>
            <p className="text-2xl font-bold text-gray-800">{statistics.avgCompletionTime} 天</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-sm text-gray-600">逾期風險</p>
            <p className="text-2xl font-bold text-gray-800">
              {tasks.length > 0 ? Math.round((statistics.overdue / tasks.length) * 100) : 0}%
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600">高優先項目</p>
            <p className="text-2xl font-bold text-gray-800">{statistics.highPriority}</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <p className="text-sm text-gray-600">活躍團隊成員</p>
            <p className="text-2xl font-bold text-gray-800">{teamProductivity.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
