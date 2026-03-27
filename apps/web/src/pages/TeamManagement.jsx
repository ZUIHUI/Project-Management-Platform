import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '../components/Modal';

const MemberCard = ({ member, onRemove, onRoleChange, availableRoles = ['Member', 'Project Lead', 'Project Admin'] }) => {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);

  const handleSaveRole = () => {
    onRoleChange?.(member.id, selectedRole);
    setIsEditingRole(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-white flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
          {member.name?.charAt(0).toUpperCase() || 'M'}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{member.name}</p>
          <p className="text-sm text-gray-500">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isEditingRole ? (
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveRole}
              className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              保存
            </button>
            <button
              onClick={() => setIsEditingRole(false)}
              className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {member.role}
            </span>
            <button
              onClick={() => setIsEditingRole(true)}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
            >
              編輯角色
            </button>
            <button
              onClick={() => onRemove?.(member.id)}
              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
            >
              移除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TeamManagement({ projectId = null, team = [], onAddMember, onRemoveMember, onRoleChange }) {
  const { projectId: routeProjectId } = useParams();
  const finalProjectId = projectId || routeProjectId || 'current';
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'Member',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMember = () => {
    if (formData.email && formData.name) {
      onAddMember?.({
        ...formData,
        projectId,
      });
      setFormData({
        email: '',
        name: '',
        role: 'Member',
      });
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team 成員管理</h2>
          <p className="text-sm text-gray-600">管理專案成員和他們的角色</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + 新增成員
        </button>
      </div>

      {/* Role Legend */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">角色說明</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="font-semibold text-sm text-blue-900">Project Admin</p>
            <p className="text-xs text-blue-700">擁有專案管理權限，可設定工作流和權限</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-blue-900">Project Lead</p>
            <p className="text-xs text-blue-700">團隊領導者，可分派任務和追蹤進度</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-blue-900">Member</p>
            <p className="text-xs text-blue-700">一般成員，可建立和編輯任務</p>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        {team.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暫無成員，點擊「新增成員」開始</p>
          </div>
        ) : (
          team.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onRemove={() => onRemoveMember?.(member.id)}
              onRoleChange={onRoleChange}
              availableRoles={['Member', 'Project Lead', 'Project Admin']}
            />
          ))
        )}
      </div>

      {/* Modal for Add Member */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="新增成員">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              成員名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入成員名稱"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              電子郵件
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              角色
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Member">Member</option>
              <option value="Project Lead">Project Lead</option>
              <option value="Project Admin">Project Admin</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAddMember}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              新增
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
    </div>
  );
}
