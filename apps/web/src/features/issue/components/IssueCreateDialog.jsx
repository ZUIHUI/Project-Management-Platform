import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { Alert, Button, FormField, MutationForm } from "../../../components/ui";
import { cn, inputClass } from "../../../components/ui/styles";
import { ISSUE_PRIORITY_OPTIONS } from "../workflowPresentation.js";

const emptyDraft = { title: "", description: "", priority: "medium" };

export default function IssueCreateDialog({ isOpen, onClose, onCreate, saving, error, onClearError }) {
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    if (isOpen) onClearError?.();
  }, [isOpen, onClearError]);

  const closeDialog = () => {
    if (saving) return;
    setDraft(emptyDraft);
    onClearError?.();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.title.trim() || saving) return;
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
      title="建立新 Issue"
      description="先定義清楚成果，再補充優先順序與必要背景。"
      maxWidth="max-w-2xl"
      closeDisabled={saving}
    >
      <MutationForm busy={saving} className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        {error ? <Alert tone="error" title="無法建立 Issue" className="sm:col-span-2">{error}</Alert> : null}

        <FormField label="Issue 標題" htmlFor="new-issue-title" required className="sm:col-span-2">
          {({ describedBy, invalid }) => (
            <input
              id="new-issue-title"
              className={inputClass}
              value={draft.title}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="例如：完成行動版導覽狀態"
              autoFocus
              required
            />
          )}
        </FormField>

        <FormField label="優先順序" htmlFor="new-issue-priority">
          <select
            id="new-issue-priority"
            className={inputClass}
            value={draft.priority}
            onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
          >
            {ISSUE_PRIORITY_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </FormField>

        <div className="hidden sm:block" />

        <FormField
          label="描述"
          htmlFor="new-issue-description"
          hint="選填；補充驗收條件、限制或必要背景。"
          className="sm:col-span-2"
        >
          <textarea
            id="new-issue-description"
            className={cn(inputClass, "min-h-32 py-3")}
            value={draft.description}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeDialog}>取消</Button>
          <Button type="submit" disabled={!draft.title.trim()}>
            {saving ? "建立中…" : "建立 Issue"}
          </Button>
        </div>
      </MutationForm>
    </Modal>
  );
}
