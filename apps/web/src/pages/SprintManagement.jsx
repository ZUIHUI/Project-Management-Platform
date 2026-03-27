import { useState } from 'react';
import Modal from './Modal';

const SprintCard = ({ sprint, onEdit, onDelete, onViewDetails }) => {
  const endDate = new Date(sprint.endAt);
  const today = new Date();
  const isActive = sprint.status === 'active';
  const isCompleted = sprint.status === 'completed';
  const isOverdue = endDate < today && !isCompleted;

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{sprint.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(sprint.startAt).toLocaleDateString('zh-TW')} ~ {new Date(sprint.endAt).toLocaleDateString('zh-TW')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive ? 'bg-blue-100 text-blue-800' :
          isCompleted ? 'bg-green-100 text-green-800' :
          isOverdue ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? '進行中' : isCompleted ? '已完成' : isOverdue ? '逾期' : '未開始'}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700">{sprint.goal || '無目標'}</p>
      </div>

      <div className="bg-gray-50 p-3 rounded mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>進度</span>
          <span>{sprint.completedTasks || 0} / {sprint.totalTasks || 0}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${sprint.totalTasks ? (sprint.completedTasks / sprint.totalTasks * 100) : 0}%`
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(sprint)}
          className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm font-medium"
        >
          查看詳情
        </button>
        <button
          onClick={() => onEdit(sprint)}
          className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
        >
          編輯
        </button>
        <button
          onClick={() => onDelete(sprint.id)}
          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
        >
          刪除
        </button>
      </div>
    </div>
  );
};

export default function SprintManagement({ projectId, sprints = [], onSave, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startAt: '',
    endAt: '',
    goal: '',
  });
  const [selectedSprint, setSelectedSprint] = useState(null);

  const handleOpenModal = (sprint = null) => {
    if (sprint) {
      setEditingSprint(sprint);
      setFormData({
        name: sprint.name,
        startAt: sprint.startAt,
        endAt: sprint.endAt,
        goal: sprint.goal,
      });
    } else {
      setEditingSprint(null);
      setFormData({
        name: '',
        startAt: '',
        endAt: '',
        goal: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    onSave?.({
      id: editingSprint?.id,
      projectId,
      ...formData,
      status: editingSprint?.status || 'pending',
    });
    setShowModal(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sprint/Cycle 管理</h2>
          <p className="text-sm text-gray-600">管理專案的迭代周期和目標</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + 建立新 Sprint
        </button>
      </div>

      <div className="grid gap-4">
        {sprints.map((sprint) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            onEdit={() => handleOpenModal(sprint)}
            onDelete={() => onDelete?.(sprint.id)}
            onViewDetails={(s) => setSelectedSprint(s)}
          />
        ))}
        {sprints.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>暫無 Sprint，點擊「建立新 Sprint」開始</p>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSprint ? '編輯 Sprint' : '建立新 Sprint'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sprint 名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sprint 1, Q2 Planning"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                開始日期
              </label>
              <input
                type="date"
                value={formData.startAt}
                onChange={(e) => handleInputChange('startAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                結束日期
              </label>
              <input
                type="date"
                value={formData.endAt}
                onChange={(e) => handleInputChange('endAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sprint 目標
            </label>
            <textarea
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="描述此 Sprint 的目標..."
              rows="3"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {editingSprint ? '更新' : '建立'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      </Modal>

      {/* Sprint Details Modal */}
      {selectedSprint && (
        <Modal isOpen={!!selectedSprint} onClose={() => setSelectedSprint(null)} title={`Sprint: ${selectedSprint.name}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">狀態</p>
                <p className="font-semibold">{selectedSprint.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">進度</p>
                <p className="font-semibold">
                  {selectedSprint.completedTasks} / {selectedSprint.totalTasks}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">目標</p>
              <p className="font-semibold">{selectedSprint.goal || '無'}</p>
            </div>
            <button
              onClick={() => setSelectedSprint(null)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              關閉
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
