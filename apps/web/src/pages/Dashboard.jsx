import { useEffect, useState } from "react";
import { fetchDashboardData } from "../services/dashboard";

const StatCard = ({ label, value }) => (
  <div className="rounded-lg border bg-white p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchDashboardData();
        setDashboard(response.data?.data ?? null);
      } catch (err) {
        setError("無法載入儀表板資料");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">載入中...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!dashboard) {
    return <p className="text-sm text-gray-500">暫無資料</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard（Phase 進度版）</h1>
        <p className="text-sm text-gray-600">以 issue 指標呈現專案執行狀況與逾期風險。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Projects" value={dashboard.totals.projects} />
        <StatCard label="Issues" value={dashboard.totals.issues} />
        <StatCard label="Notifications" value={dashboard.totals.notifications} />
        <StatCard label="Milestones" value={dashboard.totals.milestones} />
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Status Breakdown</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {dashboard.statusBreakdown.map((item) => (
            <div key={item.statusId} className="rounded border px-3 py-2 text-sm">
              {item.statusId}: {item.count}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Open Issues</h2>
          <ul className="space-y-2 text-sm">
            {dashboard.openIssues.map((issue) => (
              <li key={issue.id} className="rounded border px-3 py-2">
                #{issue.number} {issue.title}（{issue.statusId}）
              </li>
            ))}
            {dashboard.openIssues.length === 0 ? <li>目前沒有開啟中的 Issue</li> : null}
          </ul>
        </article>

        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Overdue Issues</h2>
          <ul className="space-y-2 text-sm">
            {dashboard.overdueIssues.map((issue) => (
              <li key={issue.id} className="rounded border border-red-200 bg-red-50 px-3 py-2">
                #{issue.number} {issue.title}
              </li>
            ))}
            {dashboard.overdueIssues.length === 0 ? <li>目前沒有逾期 Issue</li> : null}
          </ul>
        </article>
      </section>
    </div>
  );
}
