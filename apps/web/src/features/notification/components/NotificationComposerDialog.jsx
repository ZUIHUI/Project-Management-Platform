import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { Alert, Button, FormField } from "../../../components/ui";
import { cn, inputClass } from "../../../components/ui/styles";

export default function NotificationComposerDialog({ isOpen, onClose, onCreate, saving, error, onClearError }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) onClearError?.();
  }, [isOpen, onClearError]);

  const closeDialog = () => {
    if (saving) return;
    setMessage("");
    onClearError?.();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim() || saving) return;
    const created = await onCreate(message);
    if (created) {
      setMessage("");
      onClose?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeDialog} closeDisabled={saving} title="建立自用提醒" description="這則提醒只會出現在你的通知收件匣。">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <Alert tone="error" title="無法建立提醒">{error}</Alert> : null}
        <FormField label="提醒內容" htmlFor="notification-message" hint="描述稍後需要處理的具體事項。" required>
          <textarea
            id="notification-message"
            className={cn(inputClass, "min-h-32 py-3")}
            value={message}
            placeholder="例如：明天下午確認 Beta 里程碑的驗收結果"
            onChange={(event) => setMessage(event.target.value)}
            autoFocus
            required
          />
        </FormField>
        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeDialog} disabled={saving}>取消</Button>
          <Button type="submit" disabled={!message.trim() || saving}>{saving ? "建立中…" : "建立提醒"}</Button>
        </div>
      </form>
    </Modal>
  );
}
