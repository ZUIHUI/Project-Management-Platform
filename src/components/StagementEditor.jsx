import { useState, useEffect } from "react";

export default function StagementEditor({ project, onUpdate }) {
  const [stagements, setStagements] = useState(project.stagements || []);
  const [selectedStage, setSelectedStage] = useState(0);
  const [newTask, setNewTask] = useState("");

  // 監聽 project 切換時同步 stagements
  useEffect(() => {
    setStagements(project.stagements || []);
    setSelectedStage(0);
  }, [project]);

  // 新增任務
  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [...stagements];
    updated[selectedStage].tasks.push({ title: newTask });
    setStagements(updated);
    setNewTask("");
    onUpdate({ ...project, stagements: updated });
  };

  // 切換階段
  const handleStageClick = (idx) => {
    setSelectedStage(idx);
  };

  // 編輯階段名稱
  const handleStageNameChange = (idx, value) => {
    const updated = [...stagements];
    updated[idx].name = value;
    setStagements(updated);
    onUpdate({ ...project, stagements: updated });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <h2 className="text-xl font-bold mb-6 text-blue-700">{project.name} - 階段與任務設定</h2>
      {/* Stagement Steps UI */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center min-w-max gap-6 px-1 h-20">
          {stagements.map((stage, idx) => (
            <div key={idx} className="flex items-center">
              <button
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-base font-bold transition
                  ${selectedStage === idx
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-gray-400 text-gray-600 hover:bg-purple-100"}
                `}
                onClick={() => handleStageClick(idx)}
              >
                {idx + 1}
              </button>
              <div className="ml-2 mr-4 whitespace-nowrap relative group flex flex-col items-start">
                <input
                  className="border-b border-transparent focus:border-blue-400 bg-transparent text-base font-semibold text-gray-800 px-1 py-0.5 outline-none transition"
                  style={{ width: `${Math.max((stage.name?.length || 2) * 1.2 + 24, 48)}px` }}
                  value={stage.name}
                  placeholder={`階段${idx + 1}（可點擊修改名稱）`}
                  onChange={e => handleStageNameChange(idx, e.target.value)}
                />
                {/* 編輯提示 */}
                <span className="text-xs text-blue-400 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition pointer-events-none mt-1">
                  可直接編輯名稱
                </span>
              </div>
              {idx < stagements.length - 1 && (
                <div className="w-16 h-1 bg-gray-300 mx-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Tasks for selected stage */}
      <div>
        <h3 className="font-semibold mb-2">{stagements[selectedStage]?.name} 的任務</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="新增任務"
            className="border px-2 py-1 rounded w-64"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded"
            onClick={addTask}
          >
            新增任務
          </button>
        </div>
        <ul className="space-y-2">
          {stagements[selectedStage]?.tasks.map((task, idx) => (
            <li key={idx} className="pl-2 text-gray-800 bg-gray-100 rounded py-1">
              {task.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
