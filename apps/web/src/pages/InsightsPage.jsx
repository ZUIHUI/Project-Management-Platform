import { Activity } from "lucide-react";
import { useParams } from "react-router-dom";
import { Card, EmptyState, PageHeader } from "../components/ui";
import AssigneeCompletionCard from "../features/insight/components/AssigneeCompletionCard";
import InsightActionsCard from "../features/insight/components/InsightActionsCard";
import InsightDistributionCards from "../features/insight/components/InsightDistributionCards";
import InsightMetricGrid from "../features/insight/components/InsightMetricGrid";
import { useProjectInsights } from "../features/insight/useProjectInsights";

export default function InsightsPage({ projectId = null, tasks = [], team = [], showHeader = true }) {
  const { projectId: routeProjectId } = useParams();
  const finalProjectId = projectId || routeProjectId || "";
  const insights = useProjectInsights(tasks, team);

  return (
    <div className="space-y-6">
      {showHeader ? (
        <PageHeader
          eyebrow="交付洞察"
          title="交付洞察"
          description={finalProjectId
            ? `專案 ${finalProjectId} 的進度、日期覆蓋與工作分布。`
            : "選擇專案後查看進度、日期覆蓋與工作分布。"}
        />
      ) : null}

      {!tasks.length ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="尚無可分析的 Issue"
            description="建立並更新 Issue 後，這裡會顯示完成率、到期日覆蓋與指派分布。"
          />
        </Card>
      ) : (
        <>
          <InsightMetricGrid statistics={insights.statistics} />
          <InsightDistributionCards statistics={insights.statistics} />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
            <AssigneeCompletionCard members={insights.assigneeCompletion} />
            <InsightActionsCard statistics={insights.statistics} />
          </div>
        </>
      )}
    </div>
  );
}
