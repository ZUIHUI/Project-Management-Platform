import { useEffect, useRef, useState } from "react";
import Modal from "../../../components/Modal";
import { Alert, Button, FormField } from "../../../components/ui";
import { cn, inputClass } from "../../../components/ui/styles";

const emptyDraft = { key: "", name: "", description: "" };

export default function ProjectCreateDialog({ isOpen, onClose, onCreate, saving, error, errorField, onClearError }) {
  const [draft, setDraft] = useState(emptyDraft);
  const keyRef = useRef(null);

  useEffect(() => {
    if (isOpen) onClearError?.();
  }, [isOpen, onClearError]);

  useEffect(() => {
    if (isOpen && errorField === "key") keyRef.current?.focus();
  }, [errorField, isOpen]);

  const closeDialog = () => {
    if (saving) return;
    setDraft(emptyDraft);
    onClearError?.();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.key.trim() || !draft.name.trim() || saving) return;
    const created = await onCreate(draft);
    if (created) {
      setDraft(emptyDraft);
      onClose?.();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDialog}
      title="建立新專案"
      description="先設定穩定的識別代碼，再說明交付目標與範圍。"
      maxWidth="max-w-2xl"
      closeDisabled={saving}
    >
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} aria-busy={saving || undefined}>
        {error && !errorField ? <Alert tone="error" title="無法建立專案" className="sm:col-span-2">{error}</Alert> : null}

        <FormField label="專案代碼" htmlFor="new-project-key" hint="2–12 個字元，以英文字母開頭；可使用大寫字母、數字、底線或連字號。" error={errorField === "key" ? error : ""} required>
          {({ describedBy, invalid }) => (
            <input
              ref={keyRef}
              id="new-project-key"
              className={inputClass}
              value={draft.key}
              maxLength={12}
              pattern="[A-Z][A-Z0-9_-]{1,11}"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              placeholder="WEB"
              disabled={saving}
              onChange={(event) => {
                if (errorField === "key") onClearError?.();
                setDraft((current) => ({ ...current, key: event.target.value.toUpperCase() }));
              }}
              autoFocus
              required
            />
          )}
        </FormField>

        <FormField label="專案名稱" htmlFor="new-project-name" required>
          <input
            id="new-project-name"
            className={inputClass}
            value={draft.name}
            placeholder="網站改版"
            disabled={saving}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </FormField>

        <FormField label="專案說明" htmlFor="new-project-description" hint="選填；描述目標、範圍與成功條件。" className="sm:col-span-2">
          <textarea
            id="new-project-description"
            className={cn(inputClass, "min-h-32 py-3")}
            value={draft.description}
            placeholder="例如：改善行動版任務流，降低建立與追蹤工作的操作成本。"
            disabled={saving}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeDialog} disabled={saving}>取消</Button>
          <Button type="submit" disabled={saving || !draft.key.trim() || !draft.name.trim()}>
            {saving ? "建立中…" : "建立專案"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
