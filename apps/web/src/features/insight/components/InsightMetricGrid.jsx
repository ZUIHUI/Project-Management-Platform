import { CalendarCheck2, CircleCheck, Flag, TriangleAlert } from "lucide-react";
import { StatCard } from "../../../components/ui";

export default function InsightMetricGrid({ statistics }) {
  return (
    <section aria-label="交付指標" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="完成率"
        value={`${statistics.completionRate}%`}
        helper={`${statistics.completed} / ${statistics.total} 已完成`}
        icon={CircleCheck}
        tone="success"
      />
      <StatCard
        label="到期日覆蓋"
        value={`${statistics.dueDateCoverage}%`}
        helper={`${statistics.withDueDate} / ${statistics.total} 已設定`}
        icon={CalendarCheck2}
      />
      <StatCard
        label="逾期 Issue"
        value={statistics.overdue}
        helper="有到期日且尚未完成"
        icon={TriangleAlert}
        tone={statistics.overdue ? "danger" : "default"}
      />
      <StatCard
        label="高優先 Issue"
        value={statistics.highPriority}
        helper={`共 ${statistics.total} 筆 Issue`}
        icon={Flag}
      />
    </section>
  );
}
