import { useEffect, useState } from "react";

export default function StagementEditor({ project, onUpdate }) {
  // 根據 project.stagements 動態同步階段
  const [stagements, setStagements] = useState(project.stagements || []);
  const [openStage, setOpenStage] = useState(0);
  const [newTasks, setNewTasks] = useState(
    Array(project.stagements?.length || 0).fill("")
  );

  // 當 project.stagements 變動時同步本地 state
  useEffect(() => {
    setStagements(project.stagements || []);
    setNewTasks(Array(project.stagements?.length || 0).fill(""));
    setOpenStage(0);
  }, [project.stagements]);

  // 任務新增
  const addTask = (stageIdx) => {
    if (!newTasks[stageIdx]?.trim()) return;
    const updatedStages = stagements.map((stage, idx) =>
      idx === stageIdx
        ? {
          ...stage,
          tasks: [...(stage.tasks || []), { title: newTasks[stageIdx] }],
        }
        : stage
    );
    setStagements(updatedStages);
    setNewTasks((prev) => prev.map((t, idx) => (idx === stageIdx ? "" : t)));
    // 將最新 stagements 傳遞給父層
    onUpdate?.({ ...project, stagements: updatedStages });
  };

  // 階段名稱編輯
  const handleStageNameChange = (idx, value) => {
    const updatedStages = stagements.map((stage, i) =>
      i === idx ? { ...stage, name: value } : stage
    );
    setStagements(updatedStages);
    onUpdate?.({ ...project, stagements: updatedStages });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <h2 className="text-xl font-bold mb-6 text-blue-700">{project.name} - 階段與任務設定</h2>
      <div className="space-y-4">
        {stagements.map((stage, idx) => (
          <div key={idx} className="border border-blue-100 rounded-lg bg-blue-50/40">
            {/* 摺疊標題 */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 focus:outline-none group"
              onClick={() => setOpenStage(openStage === idx ? -1 : idx)}
              type="button"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-base font-bold transition
                    ${openStage === idx
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white border-gray-400 text-gray-600 group-hover:bg-purple-100"}
                  `}
                >
                  {idx + 1}
                </span>
                <input
                  className="border-b border-transparent focus:border-blue-400 bg-transparent text-base font-semibold text-gray-800 px-1 py-0.5 outline-none transition w-32"
                  value={stage.name}
                  placeholder={`階段${idx + 1}（可點擊修改名稱）`}
                  onChange={e => handleStageNameChange(idx, e.target.value)}
                />
              </div>
              <svg
                className={`w-5 h-5 ml-2 transition-transform duration-200 ${openStage === idx ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* 摺疊內容 */}
            {openStage === idx && (
              <div className="px-6 pb-4 pt-2">
                <h3 className="font-semibold mb-2">{stage.name || `階段${idx + 1}`} 的任務</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="新增任務"
                    className="border px-2 py-1 rounded w-64"
                    value={newTasks[idx] || ""}
                    onChange={e =>
                      setNewTasks((prev) =>
                        prev.map((t, i) => (i === idx ? e.target.value : t))
                      )
                    }
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                    onClick={() => addTask(idx)}
                    type="button"
                  >
                    新增任務
                  </button>
                </div>
                <ul className="space-y-2">
                  {(stage.tasks || []).map((task, tIdx) => (
                    <li key={tIdx} className="pl-2 text-gray-800 bg-gray-100 rounded py-1">
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
