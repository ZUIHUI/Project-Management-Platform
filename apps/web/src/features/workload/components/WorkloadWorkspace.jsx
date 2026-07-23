import { Activity } from "lucide-react";
import { Card, EmptyState, PageHeader } from "../../../components/ui";
import { useWorkloadMetrics } from "../useWorkloadMetrics";
import WorkloadGuidance from "./WorkloadGuidance";
import WorkloadMemberList from "./WorkloadMemberList";
import WorkloadMetricGrid from "./WorkloadMetricGrid";

export default function WorkloadWorkspace({ tasks = [], team = [], showHeader = true }) {
  const metrics = useWorkloadMetrics(tasks, team);

  return (
    <div className="space-y-6">
      {showHeader ? (
        <PageHeader
          eyebrow="工作分布"
          title="工作負載"
          description="比較 Issue 數量、在製工作與未指派項目；數量不等同工時或個人產能。"
        />
      ) : null}

      {!tasks.length && !team.length ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="尚無負載資料"
            description="加入專案成員並指派 Issue 後，這裡會顯示工作數量分布。"
          />
        </Card>
      ) : (
        <>
          <WorkloadMetricGrid metrics={metrics} />
          <WorkloadGuidance metrics={metrics} />
          <WorkloadMemberList metrics={metrics} />
        </>
      )}
    </div>
  );
}
