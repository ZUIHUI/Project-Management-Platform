import { useMemo } from 'react';

export default function WorkloadView({ tasks = [], team = [] }) {
  const workloadData = useMemo(() => {
    const memberWorkload = {};

    // Initialize team members
    team.forEach(member => {
      memberWorkload[member.id] = {
        name: member.name,
        email: member.email,
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
      };
    });

    // Count tasks by member and status
    tasks.forEach(task => {
      if (task.assignee && memberWorkload[task.assignee]) {
        memberWorkload[task.assignee].total++;
        if (task.status === 'Done') {
          memberWorkload[task.assignee].completed++;
        } else if (task.status === 'In Progress') {
          memberWorkload[task.assignee].inProgress++;
        } else {
          memberWorkload[task.assignee].todo++;
        }
      }
    });

    return memberWorkload;
  }, [tasks, team]);

  const data = Object.values(workloadData).filter(m => m.total > 0).sort((a, b) => b.total - a.total);

  const maxWorkload = Math.max(...data.map(m => m.total), 1);
  const avgWorkload = data.length > 0 ? Math.round(data.reduce((sum, m) => sum + m.total, 0) / data.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">工作負載分析</h2>
        <p className="text-sm text-gray-600">團隊成員的任務分配和進度概況</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">{data.length}</p>
          <p className="text-sm text-blue-700">有任務的成員</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-600">{maxWorkload}</p>
          <p className="text-sm text-orange-700">最高工作量</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">{avgWorkload}</p>
          <p className="text-sm text-green-700">平均工作量</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">
            {tasks.filter(t => t.status === 'In Progress').length}
          </p>
          <p className="text-sm text-purple-700">進行中的任務</p>
        </div>
      </div>

      {/* Workload Chart */}
      <div className="bg-white border rounded-lg p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暫無任務分配</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((member, idx) => (
              <div key={idx} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{member.total}</p>
                    <p className="text-xs text-gray-500">總任務</p>
                  </div>
                </div>

                {/* Status breakdown */}
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">待辦</span>
                      <span className="text-gray-600">{member.todo}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded"
                        style={{ width: `${member.total > 0 ? (member.todo / member.total * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">進行中</span>
                      <span className="text-gray-600">{member.inProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${member.total > 0 ? (member.inProgress / member.total * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">已完成</span>
                      <span className="text-gray-600">{member.completed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{ width: `${member.total > 0 ? (member.completed / member.total * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Overall bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`
                      h-3 rounded-full transition-all
                      ${member.total > maxWorkload * 0.8 ? 'bg-red-500' :
                        member.total > maxWorkload * 0.5 ? 'bg-yellow-500' :
                        'bg-blue-500'}
                    `}
                    style={{ width: `${(member.total / maxWorkload) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workload Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">工作負載平衡指標</h3>
          <div className="space-y-3">
            {data.slice(0, 5).map((member, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{member.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        member.total > maxWorkload * 0.8 ? 'bg-red-500' :
                        member.total > maxWorkload * 0.5 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(member.total / maxWorkload) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{member.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">建議</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {data.some(m => m.inProgress > 3) && (
              <li className="flex gap-2 items-start">
                <span className="text-yellow-600 font-bold">⚠️</span>
                <span>某些成員進行中的任務較多，可考慮幫助他們完成優先項目</span>
              </li>
            )}
            {data[0]?.total > avgWorkload * 1.5 && (
              <li className="flex gap-2 items-start">
                <span className="text-red-600 font-bold">⚠️</span>
                <span>{data[0].name} 的工作負載高於平均 50%，可考慮重新分配</span>
              </li>
            )}
            {data.length < team.length && (
              <li className="flex gap-2 items-start">
                <span className="text-blue-600 font-bold">ℹ️</span>
                <span>有 {team.length - data.length} 個團隊成員目前沒有任務分配</span>
              </li>
            )}
            {data.every(m => m.todo === 0) && (
              <li className="flex gap-2 items-start">
                <span className="text-green-600 font-bold">✓</span>
                <span>所有成員的任務分配均衡，進度良好！</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
