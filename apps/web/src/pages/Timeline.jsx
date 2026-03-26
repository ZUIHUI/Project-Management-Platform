import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { projectService } from "../features/project";

export default function Timeline() {
  const { projectId } = useParams();
  const [timeline, setTimeline] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!projectId) {
        return;
      }

      try {
        setError("");
        const response = await projectService.fetchProjectTimeline(projectId);
        setTimeline({
          ...response.data?.data,
          lastSync: response.data?.meta?.lastSync ?? null,
        });
      } catch (loadError) {
        setError(loadError?.response?.data?.error?.message ?? "無法載入 Timeline");
      }
    };

    load();
  }, [projectId]);

  const grouped = useMemo(() => {
    const items = timeline?.items ?? [];
    return {
      sprint: items.filter((item) => item.type === "sprint"),
      milestone: items.filter((item) => item.type === "milestone"),
      issue: items.filter((item) => item.type === "issue"),
    };
  }, [timeline]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!timeline) {
    return <p className="text-sm text-gray-500">載入 Timeline 中...</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Timeline - {timeline.project?.name}</h1>
        <p className="text-sm text-gray-500">最後同步：{timeline.lastSync ?? "N/A"}</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          { key: "sprint", title: "Sprints" },
          { key: "milestone", title: "Milestones" },
          { key: "issue", title: "Dated Issues" },
        ].map((group) => (
          <article key={group.key} className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{group.title}</h2>
            <div className="space-y-3 text-sm">
              {grouped[group.key].length === 0 ? <p className="text-gray-500">尚無資料</p> : null}
              {grouped[group.key].map((item) => (
                <div key={item.id} className="rounded border p-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">狀態：{item.status ?? "n/a"}</p>
                  <p className="text-xs text-gray-500">
                    {item.startAt ? `Start: ${item.startAt}` : ""} {item.endAt ? `End: ${item.endAt}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
