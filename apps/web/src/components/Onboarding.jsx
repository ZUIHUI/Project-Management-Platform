import { useEffect, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { safeStorage } from "../shared/storage";
import { Button, Card, IconButton } from "./ui";

const steps = [
  { title: "檢視專案", description: "確認專案範圍、里程碑與迭代節奏。" },
  { title: "理解工作", description: "查看 Issue、負責人與目前優先順序。" },
  { title: "追蹤交付", description: "透過看板、時間軸與分析掌握進度。" },
];

export default function Onboarding({ userId }) {
  const [visible, setVisible] = useState(false);
  const storageKey = `pmp-onboarding-complete:${userId || "unknown"}`;

  useEffect(() => {
    setVisible(!safeStorage.get(storageKey));
  }, [storageKey]);

  const finish = () => {
    safeStorage.set(storageKey, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="relative overflow-hidden bg-canvas p-5 sm:p-6">
      <IconButton label="關閉新手引導" className="absolute right-3 top-3" onClick={finish}>
        <X size={18} aria-hidden="true" />
      </IconButton>
      <div className="pr-12">
        <p className="text-xs font-semibold tracking-[0.12em] text-muted">開始使用</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">三步建立清楚的交付節奏</h2>
        <p className="mt-1 text-sm text-body">從專案範圍開始，讓團隊知道現在該做什麼、下一步往哪裡走。</p>
      </div>

      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3 rounded-card bg-surface p-4">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-semibold text-white">
              {index + 1}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-body">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button as={Link} to="/projects">
          查看專案
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
        <Button variant="ghost" onClick={finish}>
          <Check size={17} aria-hidden="true" />
          我已熟悉流程
        </Button>
      </div>
    </Card>
  );
}
