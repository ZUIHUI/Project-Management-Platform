import { useState } from 'react';
import Modal from './Modal';

const TagBadge = ({ tag, onEdit, onDelete, selected = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full font-medium cursor-pointer transition-all
        ${selected ? 'ring-2 ring-blue-500' : ''}
        ${!onClick ? 'hover:shadow-md' : 'hover:opacity-80'}
      `}
      style={{
        backgroundColor: tag.color || '#e0e0e0',
        color: getTextColor(tag.color),
      }}
    >
      <span>{tag.name}</span>
      {onEdit && onDelete && (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tag);
            }}
             className="hover:opacity-70 text-sm"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tag.id);
            }}
            className="hover:opacity-70 text-sm"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

const getTextColor = (bgColor) => {
  // Simple heuristic for light vs dark backgrounds
  if (!bgColor) return '#000';
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

const ColorPicker = ({ value, onChange }) => {
  const colors = [
    '#ff6b6b', '#ee5a52', '#ffa94d', '#ffd43b', '#74b816',
    '#51cf66', '#20c997', '#15aabf', '#1971c2', '#4c6ef5',
    '#7950f2', '#9775fa', '#d6336c', '#ff922b', '#868e96'
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
            value === color ? 'border-gray-800' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
};

export default function TagsManagement({ organizationId, tags = [], onSave, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#4c6ef5',
  });
  const [tagFilter, setTagFilter] = useState('');

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        color: tag.color || '#4c6ef5',
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        color: '#4c6ef5',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (formData.name.trim()) {
      onSave?.({
        id: editingTag?.id,
        organizationId,
        ...formData,
      });
      setShowModal(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">標籤管理</h2>
          <p className="text-sm text-gray-600">建立和管理組織的標籤</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + 新增標籤
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          placeholder="搜尋標籤..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags Display */}
      <div className="bg-white border rounded-lg p-6">
        {filteredTags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {tags.length === 0 ? (
              <p>暫無標籤，點擊「新增標籤」開始</p>
            ) : (
              <p>未找到符合的標籤</p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {filteredTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onEdit={() => handleOpenModal(tag)}
                onDelete={() => onDelete?.(tag.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tag Statistics */}
      {tags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{tags.length}</p>
            <p className="text-sm text-blue-700">總標籤數</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {tags.filter(t => t.taskCount > 0).length}
            </p>
            <p className="text-sm text-green-700">正在使用</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">
              {tags.reduce((sum, t) => sum + (t.taskCount || 0), 0)}
            </p>
            <p className="text-sm text-purple-700">總使用次數</p>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTag ? '編輯標籤' : '新增標籤'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              標籤名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bug, Feature, Documentation"
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.name.length}/30</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              顏色
            </label>
            <ColorPicker
              value={formData.color}
              onChange={(color) => handleInputChange('color', color)}
            />
            <div className="mt-2 p-2 rounded flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-xs text-gray-600">{formData.color}</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">預覽</p>
            <TagBadge tag={formData} />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {editingTag ? '更新' : '建立'}
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
