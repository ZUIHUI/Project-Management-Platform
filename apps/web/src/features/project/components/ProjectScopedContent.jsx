import { FolderX } from "lucide-react";
import { Card, EmptyState, LoadingState } from "../../../components/ui";

export default function ProjectScopedContent({
  loading,
  error,
  project,
  loadingLabel,
  children,
}) {
  if (loading) {
    return <Card><LoadingState label={loadingLabel} /></Card>;
  }

  if (error) return null;

  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={FolderX}
          title="沒有可用的專案"
          description="建立專案或取得專案權限後，即可使用這個工作視圖。"
        />
      </Card>
    );
  }

  return children;
}
