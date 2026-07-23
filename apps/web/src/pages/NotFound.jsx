import { FolderKanban, Home, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card, EmptyState, PageHeader } from "../components/ui";

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="導覽"
        title="找不到此頁面"
        description="這個連結可能已失效、路徑有誤，或目標頁面已經移動。"
      />
      <Card>
        <EmptyState
          icon={SearchX}
          title="目前無法開啟指定頁面"
          description="你可以返回工作首頁，或從專案清單重新選擇要處理的範圍。"
          action={(
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button as={Link} to="/home" className="w-full sm:w-auto">
                <Home size={17} aria-hidden="true" />
                返回首頁
              </Button>
              <Button as={Link} to="/projects" variant="secondary" className="w-full sm:w-auto">
                <FolderKanban size={17} aria-hidden="true" />
                查看專案
              </Button>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
