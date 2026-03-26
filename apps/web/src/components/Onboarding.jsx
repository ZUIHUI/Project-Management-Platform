import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { safeStorage } from "../shared/storage";

const steps = [
  {
    title: "Step 1: 了解儀表板",
    desc: "Dashboard 顯示專案統計與近期活動，先確認現有資料。",
  },
  {
    title: "Step 2: 建立專案",
    desc: "到『專案設定』建立新專案，並設定名稱與描述。",
  },
  {
    title: "Step 3: 新增任務",
    desc: "切換到『專案任務』建立 issue，並測試指派、狀態流轉。",
  },
  {
    title: "Step 4: 連接後端 API",
    desc: "確保已登入取得 token，透過 /api/v1 系列端點讀寫資料。",
  },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const complete = safeStorage.get("pmp-onboarding-complete");
    if (!complete) {
      setVisible(true);
    }
  }, []);

  const finish = () => {
    safeStorage.set("pmp-onboarding-complete", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-lg mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-800">歡迎使用專案管理平台</h2>
          <p className="mt-1 text-blue-700">這是快速導覽，請先完成 4 個步驟。</p>
        </div>
        <button
          onClick={finish}
          className="px-3 py-1 rounded text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800"
        >
          稍後再說
        </button>
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((step, idx) => (
          <li key={idx} className="bg-white p-3 rounded border border-blue-100">
            <h3 className="font-semibold text-blue-700">{idx + 1}. {step.title}</h3>
            <p className="text-blue-600 text-sm mt-1">{step.desc}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex gap-2">
        <Link
          to="/projects"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          前往專案設定
        </Link>
        <Link
          to="/tasks"
          className="bg-white text-blue-700 px-4 py-2 rounded border border-blue-300 hover:bg-blue-100"
        >
          前往專案任務
        </Link>
        <button
          onClick={finish}
          className="ml-auto text-blue-700 underline"
        >
          不再顯示
        </button>
      </div>
    </div>
  );
}
