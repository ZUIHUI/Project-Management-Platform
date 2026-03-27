import { useState } from 'react';
import Modal from './Modal';

const MilestoneCard = ({ milestone, onEdit, onDelete, onViewDetails }) => {
  const dueDate = new Date(milestone.dueAt);
  const today = new Date();
  const isOverdue = dueDate < today && milestone.status !== 'completed';
  const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{milestone.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            截止日期：{dueDate.toLocaleDateString('zh-TW')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
          isOverdue ? 'bg-red-100 text-red-800' :
          daysUntil <= 7 ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {milestone.status === 'completed' ? '已完成' :
           isOverdue ? `逾期 ${Math.abs(daysUntil)} 天` :
           daysUntil <= 7 ? `剩餘 ${daysUntil} 天` :
           `剩餘 ${daysUntil} 天`}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4">{milestone.description || '無描述'}</p>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>關聯任務</span>
          <span>{milestone.completedTasks || 0} / {milestone.totalTasks || 0}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{
              width: `${milestone.totalTasks ? (milestone.completedTasks / milestone.totalTasks * 100) : 0}%`
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(milestone)}
          className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm font-medium"
        >
          查看詳情
        </button>
        <button
          onClick={() => onEdit(milestone)}
          className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
        >
          編輯
        </button>
        <button
          onClick={() => onDelete(milestone.id)}
          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
        >
          刪除
        </button>
      </div>
    </div>
  );
};

export default function MilestoneManagement({ projectId, milestones = [], onSave, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueAt: '',
  });
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const handleOpenModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        name: milestone.name,
        description: milestone.description,
        dueAt: milestone.dueAt,
      });
    } else {
      setEditingMilestone(null);
      setFormData({
        name: '',
        description: '',
        dueAt: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    onSave?.({
      id: editingMilestone?.id,
      projectId,
      ...formData,
      status: editingMilestone?.status || 'pending',
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
          <h2 className="text-2xl font-bold">Milestone 管理</h2>
          <p className="text-sm text-gray-600">管理專案的里程碑和關鍵節點</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + 建立新 Milestone
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            onEdit={() => handleOpenModal(milestone)}
            onDelete={() => onDelete?.(milestone.id)}
            onViewDetails={(m) => setSelectedMilestone(m)}
          />
        ))}
        {milestones.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p>暫無 Milestone，點擊「建立新 Milestone」開始</p>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMilestone ? '編輯 Milestone' : '建立新 Milestone'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Milestone 名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., v1.0 Release, Design System Launch"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="描述此 Milestone 的目標和內容..."
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              截止日期
            </label>
            <input
              type="date"
              value={formData.dueAt}
              onChange={(e) => handleInputChange('dueAt', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {editingMilestone ? '更新' : '建立'}
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

      {/* Milestone Details Modal */}
      {selectedMilestone && (
        <Modal isOpen={!!selectedMilestone} onClose={() => setSelectedMilestone(null)} title={`Milestone: ${selectedMilestone.name}`}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">描述</p>
              <p className="font-semibold">{selectedMilestone.description || '無'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">截止日期</p>
                <p className="font-semibold">
                  {new Date(selectedMilestone.dueAt).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">狀態</p>
                <p className="font-semibold">{selectedMilestone.status}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">進度</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${selectedMilestone.totalTasks ? (selectedMilestone.completedTasks / selectedMilestone.totalTasks * 100) : 0}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {selectedMilestone.completedTasks} / {selectedMilestone.totalTasks} 任務完成
              </p>
            </div>
            <button
              onClick={() => setSelectedMilestone(null)}
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
