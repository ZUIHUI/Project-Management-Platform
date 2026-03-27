import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

const ActivityItem = ({ activity }) => {
  const actionLabel = {
    'create': '建立',
    'update': '更新',
    'delete': '刪除',
    'status_change': '更改狀態',
    'assign': '指派',
    'comment': '評論',
    'mention': '提及',
    'attach': '附加',
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return '✚';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'status_change': return '→';
      case 'assign': return '👤';
      case 'comment': return '💬';
      case 'mention': return '@';
      case 'attach': return '📎';
      default: return '•';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'status_change': return 'bg-yellow-100 text-yellow-800';
      case 'assign': return 'bg-purple-100 text-purple-800';
      case 'comment': return 'bg-cyan-100 text-cyan-800';
      case 'mention': return 'bg-indigo-100 text-indigo-800';
      case 'attach': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex gap-4 py-3 border-b last:border-b-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getActionColor(activity.action)}`}>
        {getActionIcon(activity.action)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-800">{activity.actor}</span>
          <span className="text-sm text-gray-600">{actionLabel[activity.action] || activity.action}</span>
          {activity.entityType && (
            <span className="text-sm text-gray-500">{activity.entityType}</span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {activity.details && (
            <p className="mb-1">{activity.details}</p>
          )}
        </div>
        {activity.before && activity.after && (
          <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 mb-1">
            <p><span className="line-through text-red-600">{activity.before}</span> → <span className="text-green-600">{activity.after}</span></p>
          </div>
        )}
        <p className="text-xs text-gray-400">
          {new Date(activity.timestamp).toLocaleString('zh-TW')}
        </p>
      </div>
    </div>
  );
};

export default function ActivityLogView({ projectId = null, activities = [] }) {
  const { projectId: routeProjectId } = useParams();
  const finalProjectId = projectId || routeProjectId || 'current';
  const [filterAction, setFilterAction] = useState('all');
  const [filterActor, setFilterActor] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Extract unique actors for filter
  const uniqueActors = useMemo(() => {
    return [...new Set(activities.map(a => a.actor))];
  }, [activities]);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (filterAction !== 'all') {
      filtered = filtered.filter(a => a.action === filterAction);
    }

    if (filterActor !== 'all') {
      filtered = filtered.filter(a => a.actor === filterActor);
    }

    return filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [activities, filterAction, filterActor, sortOrder]);

  const actionTypes = [
    'create', 'update', 'delete', 'status_change', 'assign', 'comment', 'mention', 'attach'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">活動日誌</h2>
        <p className="text-sm text-gray-600">查看專案中的所有活動和變更</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            操作類型
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action === 'create' ? '建立' :
                 action === 'update' ? '更新' :
                 action === 'delete' ? '刪除' :
                 action === 'status_change' ? '更改狀態' :
                 action === 'assign' ? '指派' :
                 action === 'comment' ? '評論' :
                 action === 'mention' ? '提及' :
                 action === 'attach' ? '附加' : action}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            參與人員
          </label>
          <select
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            {uniqueActors.sort().map((actor) => (
              <option key={actor} value={actor}>
                {actor}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            排序
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">最新在上</option>
            <option value="asc">最舊在上</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white border rounded-lg">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暫無活動記錄</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredActivities.map((activity, idx) => (
              <ActivityItem key={activity.id || idx} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {activities.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{activities.length}</p>
            <p className="text-sm text-blue-700">總活動數</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {activities.filter(a => a.action === 'create').length}
            </p>
            <p className="text-sm text-green-700">新增</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-600">
              {activities.filter(a => a.action === 'update').length}
            </p>
            <p className="text-sm text-orange-700">更新</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">
              {uniqueActors.length}
            </p>
            <p className="text-sm text-purple-700">參與人數</p>
          </div>
        </div>
      )}
    </div>
  );
}
