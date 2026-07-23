import Modal from "../../../components/Modal";
import { Alert, Button } from "../../../components/ui";

export default function ProjectArchiveDialog({ project, onClose, onConfirm, saving, error, onClearError }) {
  const closeDialog = () => {
    if (saving) return;
    onClearError?.();
    onClose?.();
  };

  const handleConfirm = async () => {
    if (!project || saving) return;
    const archived = await onConfirm(project);
    if (archived) onClose?.();
  };

  return (
    <Modal
      isOpen={Boolean(project)}
      onClose={closeDialog}
      closeDisabled={saving}
      title="封存專案"
      description="封存後仍保留資料，但專案會切換為唯讀狀態。"
    >
      <div className="space-y-5">
        {error ? <Alert tone="error" title="無法封存專案">{error}</Alert> : null}
        <p className="text-sm leading-6 text-body">
          確定要封存「<strong className="text-ink">{project?.name}</strong>」嗎？若仍有未完成的高優先 Issue，請先完成或調整後再封存。
        </p>
        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeDialog} disabled={saving}>取消</Button>
          <Button variant="danger" onClick={handleConfirm} disabled={saving}>{saving ? "封存中…" : "確認封存"}</Button>
        </div>
      </div>
    </Modal>
  );
}
