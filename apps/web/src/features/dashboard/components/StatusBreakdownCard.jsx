import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { Card, CardHeader, EmptyState } from "../../../components/ui";
import { getWorkflowStatusLabel } from "../../issue/workflowPresentation.js";

export default function StatusBreakdownCard({ items, maxCount }) {
  return (
    <Card>
      <CardHeader title="工作狀態分布" description="比較各狀態目前承載的工作量。" />
      {items.length ? (
        <div className="grid gap-6 px-5 py-6 sm:grid-cols-3 sm:px-6">
          {items.map((item) => {
            const percentage = maxCount ? Math.round((item.count / maxCount) * 100) : 0;
            const statusLabel = getWorkflowStatusLabel({ id: item.statusId, name: item.statusName });
            return (
              <div key={item.statusId}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {statusLabel}
                  </span>
                  <span className="font-mono text-sm text-body">{item.count}</span>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-pill bg-surface-strong"
                  role="progressbar"
                  aria-label={`${statusLabel} ${item.count} 筆`}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-valuenow={item.count}
                >
                  <div
                    className="h-full rounded-pill bg-brand"
                    style={{ width: `${Math.max(percentage, item.count ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          compact
          icon={ChartNoAxesColumnIncreasing}
          title="尚無狀態資料"
          description="Issue 建立後會在這裡顯示工作量分布。"
        />
      )}
    </Card>
  );
}
