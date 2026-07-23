import { Activity, ListTodo, Scale, Users } from "lucide-react";
import { StatCard } from "../../../components/ui";

export default function WorkloadMetricGrid({ metrics }) {
  return (
    <section aria-label="Issue 數量摘要" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="有任務成員"
        value={metrics.activeMembers.length}
        helper={`共 ${metrics.members.length} 位成員`}
        icon={Users}
      />
      <StatCard
        label="平均 Issue 數"
        value={metrics.averageIssueCount}
        helper="依全部專案成員計算"
        icon={Scale}
      />
      <StatCard
        label="進行中"
        value={metrics.inProgressCount}
        helper="目前在製工作"
        icon={Activity}
      />
      <StatCard
        label="未指派"
        value={metrics.unassignedCount}
        helper="需要明確負責人"
        icon={ListTodo}
        tone={metrics.unassignedCount ? "danger" : "default"}
      />
    </section>
  );
}
