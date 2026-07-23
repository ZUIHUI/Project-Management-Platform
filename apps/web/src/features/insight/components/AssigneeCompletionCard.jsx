import { Users } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState } from "../../../components/ui";

export default function AssigneeCompletionCard({ members }) {
  return (
    <Card>
      <CardHeader title="指派完成分布" description="依指派 Issue 數排列；百分比只描述目前清單狀態。" />
      {members.length ? (
        <div className="divide-y divide-line-soft">
          {members.map((member) => (
            <article key={member.id} className="p-5 sm:p-6">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-ink">{member.name}</h3>
                  {member.email ? <p className="mt-1 truncate text-xs text-muted">{member.email}</p> : null}
                  <p className="mt-1 text-xs text-muted">{member.completed} / {member.total} 已完成</p>
                </div>
                <Badge tone="neutral" className="w-fit">{member.completionRate}%</Badge>
              </div>
              <div
                className="h-2 overflow-hidden rounded-pill bg-surface-strong"
                role="progressbar"
                aria-label={`${member.name} 完成比例`}
                aria-valuenow={member.completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-pill bg-brand" style={{ width: `${member.completionRate}%` }} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          compact
          icon={Users}
          title="尚無指派資料"
          description="指派 Issue 後即可依成員查看完成數量與比例。"
        />
      )}
    </Card>
  );
}
