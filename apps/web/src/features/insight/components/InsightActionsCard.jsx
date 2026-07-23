import { CalendarClock, CircleCheck, Flag, ListChecks, TriangleAlert } from "lucide-react";
import { Card, CardHeader } from "../../../components/ui";

function ActionItem({ icon, title, description, tone = "brand" }) {
  const ActionIcon = icon;
  const toneClass = tone === "danger"
    ? "text-danger"
    : tone === "success"
      ? "text-success-strong"
      : "text-brand";
  return (
    <div className="flex gap-3 rounded-control border border-line p-4">
      <ActionIcon size={20} className={`mt-0.5 shrink-0 ${toneClass}`} aria-hidden="true" />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm leading-6 text-body">{description}</p>
      </div>
    </div>
  );
}

export default function InsightActionsCard({ statistics }) {
  return (
    <Card>
      <CardHeader title="需要注意" description="只根據目前 Issue 欄位整理的行動提示。" />
      <div className="space-y-4 p-5 sm:p-6">
        {statistics.overdue ? (
          <ActionItem
            icon={TriangleAlert}
            tone="danger"
            title={`處理 ${statistics.overdue} 筆逾期 Issue`}
            description="先確認到期日仍有效，再調整優先順序或移除阻礙。"
          />
        ) : (
          <ActionItem
            icon={CircleCheck}
            tone="success"
            title="目前沒有逾期且未完成的 Issue"
            description="這只表示目前到期日資料未出現逾期，不代表整體交付健康度。"
          />
        )}
        {statistics.withoutDueDate ? (
          <ActionItem
            icon={CalendarClock}
            title={`${statistics.withoutDueDate} 筆 Issue 未設定到期日`}
            description="若工作有時間承諾，補上日期才能納入逾期判斷。"
          />
        ) : null}
        {statistics.highPriority ? (
          <ActionItem
            icon={Flag}
            title={`${statistics.highPriority} 筆高優先工作`}
            description="確認高優先項目是否已有負責人與明確下一步。"
          />
        ) : null}
        <ActionItem
          icon={ListChecks}
          title={`${statistics.inProgress} 筆進行中`}
          description={`另有 ${statistics.todo} 筆待辦，可在規劃時一起檢查在製工作量。`}
        />
      </div>
    </Card>
  );
}
