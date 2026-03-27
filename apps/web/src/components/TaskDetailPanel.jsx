import { useState } from 'react';

export default function TaskDetailPanel({ task, onClose, onUpdate, team = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(task || {});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onUpdate?.(formData);
    setIsEditing(false);
  };

  const taskStatusColor = task?.status === 'Done' ? 'bg-green-100 text-green-800' :
    task?.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
    'bg-gray-100 text-gray-800';

  const priorityColor = task?.priority === 'high' ? 'text-red-600' :
    task?.priority === 'medium' ? 'text-yellow-600' :
    'text-green-600';

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-lg z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-bold truncate">{task?.number && `#${task.number}`}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            標題
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800">{task?.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            描述
          </label>
          {isEditing ? (
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm text-gray-600">
              {task?.description || '無描述'}
            </p>
          )}
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              狀態
            </label>
            {isEditing ? (
              <select
                value={formData.status || ''}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            ) : (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${taskStatusColor}`}>
                {task?.status || 'Todo'}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              優先級
            </label>
            {isEditing ? (
              <select
                value={formData.priority || ''}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">未設定</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            ) : (
              <p className={`font-semibold ${priorityColor}`}>
                {task?.priority ? task.priority.toUpperCase() : '未設定'}
              </p>
            )}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            指派給
          </label>
          {isEditing ? (
            <select
              value={formData.assignee || ''}
              onChange={(e) => handleInputChange('assignee', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">未指派</option>
              {team.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-semibold">
                {task?.assignee?.charAt(0) || '未'}
              </div>
              <span>{task?.assignee || '未指派'}</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            截止日期
          </label>
          {isEditing ? (
            <input
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm text-gray-600">
              {task?.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-TW') : '無截止日期'}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            標籤
          </label>
          <div className="flex flex-wrap gap-2">
            {task?.tags?.map((tag, idx) => (
              <span key={idx} className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {tag}
              </span>
            ))}
            {(!task?.tags || task.tags.length === 0) && (
              <p className="text-sm text-gray-500">無標籤</p>
            )}
          </div>
        </div>

        {/* Activity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            活動
          </label>
          <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">
              建立: {task?.createdAt ? new Date(task.createdAt).toLocaleString('zh-TW') : '未知'}
            </p>
            <p className="text-xs text-gray-500">
              更新: {task?.updatedAt ? new Date(task.updatedAt).toLocaleString('zh-TW') : '未知'}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-gray-700 mb-3">意見</h4>
          <div className="space-y-3 mb-4">
            {task?.comments?.map((comment, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-gray-700">{comment.author}</p>
                <p className="text-sm text-gray-600 mt-1">{comment.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(comment.createdAt).toLocaleString('zh-TW')}
                </p>
              </div>
            ))}
          </div>
          <textarea
            placeholder="新增意見..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(task);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              編輯
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
