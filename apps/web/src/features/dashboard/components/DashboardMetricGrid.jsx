import { Bell, CircleDot, Flag, FolderKanban } from "lucide-react";
import { StatCard } from "../../../components/ui";

export default function DashboardMetricGrid({ totals }) {
  return (
    <section aria-label="關鍵指標" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="可存取專案" value={totals.projects ?? 0} icon={FolderKanban} />
      <StatCard label="Issue 總數" value={totals.issues ?? 0} icon={CircleDot} />
      <StatCard label="未讀通知" value={totals.notifications ?? 0} icon={Bell} />
      <StatCard label="里程碑" value={totals.milestones ?? 0} icon={Flag} />
    </section>
  );
}
