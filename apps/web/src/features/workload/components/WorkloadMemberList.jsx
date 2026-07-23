import { Users } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState } from "../../../components/ui";

export default function WorkloadMemberList({ metrics }) {
  return (
    <Card>
      <CardHeader
        title="成員 Issue 數量分布"
        description="依總 Issue 數由高到低排列；長條只比較數量，不代表工時或產能。"
      />
      {metrics.members.length ? (
        <div className="divide-y divide-line-soft">
          {metrics.members.map((member) => {
            const relative = metrics.maxIssueCount
              ? (member.total / metrics.maxIssueCount) * 100
              : 0;
            const aboveAverage = metrics.aboveAverageMembers.some((item) => item.id === member.id);
            return (
              <article key={member.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-ink">{member.name}</h3>
                    {member.email ? <p className="mt-1 truncate text-xs text-muted">{member.email}</p> : null}
                  </div>
                  <Badge tone={aboveAverage ? "brand" : "neutral"} className="w-fit">
                    {member.total === 0
                      ? "尚無工作"
                      : `${member.total} 筆${aboveAverage ? " · 高於平均" : ""}`}
                  </Badge>
                </div>
                <div
                  className="mt-4 h-3 overflow-hidden rounded-pill bg-surface-strong"
                  role="progressbar"
                  aria-label={`${member.name} 指派 ${member.total} 筆 Issue`}
                  aria-valuenow={member.total}
                  aria-valuemin={0}
                  aria-valuemax={Math.max(metrics.maxIssueCount, 1)}
                >
                  <div className="h-full rounded-pill bg-brand" style={{ width: `${relative}%` }} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div><dt className="text-muted">待辦</dt><dd className="mt-1 font-mono font-semibold text-ink">{member.todo}</dd></div>
                  <div><dt className="text-muted">進行中</dt><dd className="mt-1 font-mono font-semibold text-ink">{member.inProgress}</dd></div>
                  <div><dt className="text-muted">已完成</dt><dd className="mt-1 font-mono font-semibold text-ink">{member.completed}</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Users} title="尚無成員" description="加入成員後即可比較每個人的 Issue 數量。" />
      )}
    </Card>
  );
}
