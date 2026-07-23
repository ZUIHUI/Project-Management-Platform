import { Activity, CircleCheck, Scale, TriangleAlert } from "lucide-react";
import { Alert, Card, CardHeader } from "../../../components/ui";

function GuidanceItem({ icon, children, tone = "brand" }) {
  const GuidanceIcon = icon;
  const toneClass = tone === "danger"
    ? "text-danger"
    : tone === "success"
      ? "text-success-strong"
      : "text-brand";
  return (
    <div className="flex gap-3">
      <GuidanceIcon size={20} className={`mt-0.5 shrink-0 ${toneClass}`} aria-hidden="true" />
      <p className="text-sm leading-6 text-body">{children}</p>
    </div>
  );
}

export default function WorkloadGuidance({ metrics }) {
  const hasSignals = metrics.unassignedCount
    || metrics.aboveAverageMembers.length
    || metrics.hasConcurrentWorkSignal;

  return (
    <>
      {metrics.unassignedCount || metrics.aboveAverageMembers.length ? (
        <Alert tone="info" title="數量提示">
          {metrics.unassignedCount ? `${metrics.unassignedCount} 筆 Issue 尚未指派。` : ""}
          {metrics.unassignedCount && metrics.aboveAverageMembers.length ? " " : ""}
          {metrics.aboveAverageMembers.length
            ? `${metrics.aboveAverageMembers.map((member) => member.name).join("、")} 的 Issue 數高於團隊平均 50%。`
            : ""}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="數量基準" description="以 Issue 筆數作初步比較，不代表工時或個人產能承諾。" />
          <dl className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between rounded-control bg-surface p-4"><dt className="text-sm text-body">最高 Issue 數</dt><dd className="font-mono text-xl font-semibold text-ink">{metrics.maxIssueCount}</dd></div>
            <div className="flex items-center justify-between rounded-control bg-surface p-4"><dt className="text-sm text-body">團隊平均</dt><dd className="font-mono text-xl font-semibold text-ink">{metrics.averageIssueCount}</dd></div>
            <div className="flex items-center justify-between rounded-control bg-surface p-4"><dt className="text-sm text-body">完成 Issue</dt><dd className="font-mono text-xl font-semibold text-ink">{metrics.completedCount}</dd></div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="下一步建議" description="把數量提示轉成需要人工確認的團隊對話。" />
          <div className="space-y-4 p-5 sm:p-6">
            {metrics.unassignedCount ? (
              <GuidanceItem icon={TriangleAlert} tone="danger">先替未指派 Issue 確認負責人，避免工作停在模糊地帶。</GuidanceItem>
            ) : null}
            {metrics.aboveAverageMembers.length ? (
              <GuidanceItem icon={Scale}>和 Issue 數高於平均 50% 的成員檢查優先順序、複雜度與可轉移項目。</GuidanceItem>
            ) : null}
            {metrics.hasConcurrentWorkSignal ? (
              <GuidanceItem icon={Activity}>部分成員同時進行超過三件工作，可確認是否需要先完成再開新項目。</GuidanceItem>
            ) : null}
            {!hasSignals ? (
              <GuidanceItem icon={CircleCheck} tone="success">目前未出現上述數量條件；仍需在規劃會議確認工作複雜度與實際容量。</GuidanceItem>
            ) : null}
          </div>
        </Card>
      </div>
    </>
  );
}
