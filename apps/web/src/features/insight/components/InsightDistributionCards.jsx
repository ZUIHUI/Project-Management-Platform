import { Badge, Card, CardHeader } from "../../../components/ui";

function MetricBar({ label, value, max }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-body">{value}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-pill bg-surface-strong"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="h-full rounded-pill bg-brand" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function InsightDistributionCards({ statistics }) {
  const statuses = [
    { label: "待辦", value: statistics.todo, tone: "neutral" },
    { label: "進行中", value: statistics.inProgress, tone: "brand" },
    { label: "已完成", value: statistics.completed, tone: "success" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader title="狀態分布" description="目前工作在流程中的位置。" />
        <div className="grid divide-y divide-line-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {statuses.map((item) => (
            <div key={item.label} className="p-5 text-center sm:p-6">
              <Badge tone={item.tone}>{item.label}</Badge>
              <p className="mt-4 font-mono text-4xl font-medium tracking-tight text-ink">{item.value}</p>
              <p className="mt-2 text-xs text-muted">
                占全部 {statistics.total ? Math.round((item.value / statistics.total) * 100) : 0}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="優先級分布" description="以同一尺度比較目前工作排序。" />
        <div className="space-y-6 p-5 sm:p-6">
          <MetricBar label="高優先級" value={statistics.highPriority} max={statistics.total} />
          <MetricBar label="中優先級" value={statistics.mediumPriority} max={statistics.total} />
          <MetricBar label="低優先級" value={statistics.lowPriority} max={statistics.total} />
        </div>
      </Card>
    </div>
  );
}
