import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, Pencil } from "lucide-react";
import Modal from "./Modal";
import { Alert, Badge, Button, FormField } from "./ui";
import { cn, inputClass } from "./ui/styles";
import { getApiErrorMessage } from "../shared/api/apiErrorPresentation.js";
import {
  DEFAULT_WORKFLOW_STATUS_OPTIONS,
  ISSUE_PRIORITY_OPTIONS,
  getIssuePriorityPresentation,
  getWorkflowStatusLabel,
  getWorkflowStatusTone,
} from "../features/issue/workflowPresentation.js";

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const createTaskDraft = (task) => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  statusId: task?.statusId ?? "todo",
  priority: task?.priority ?? "medium",
  assignee: task?.assignee ?? "",
  dueDate: toDateInputValue(task?.dueDate),
});

export default function TaskDetailPanel({ task, onClose, onUpdate, team = [], statusOptions = DEFAULT_WORKFLOW_STATUS_OPTIONS }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [discardIntent, setDiscardIntent] = useState(null);
  const [formData, setFormData] = useState(() => createTaskDraft(task));
  const discardPromptRef = useRef(null);
  const titleInputRef = useRef(null);
  const canEdit = typeof onUpdate === "function";
  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(createTaskDraft(task)),
    [formData, task],
  );
  const assigneeName = team.find((member) => member.id === task?.assignee)?.name ?? task?.assignee;
  const currentStatus = statusOptions.find((status) => status.id === task?.statusId);
  const priority = getIssuePriorityPresentation(task?.priority);

  useEffect(() => {
    setFormData(createTaskDraft(task));
    setIsEditing(false);
    setSaveError("");
    setTitleError("");
    setDiscardIntent(null);
  }, [task]);

  useEffect(() => {
    if (discardIntent) discardPromptRef.current?.focus();
  }, [discardIntent]);

  const handleInputChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setSaveError("");
    setDiscardIntent(null);
    if (field === "title") setTitleError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const title = formData.title.trim();
    if (!title) {
      setTitleError("請輸入 Issue 標題。");
      titleInputRef.current?.focus();
      return;
    }

    setSaving(true);
    setSaveError("");
    setTitleError("");
    try {
      await onUpdate({
        ...task,
        ...formData,
        title,
        assignee: formData.assignee || null,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00.000Z` : null,
      });
      setFormData((current) => ({ ...current, title }));
      setIsEditing(false);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Issue 儲存失敗，請稍後再試。"));
    } finally {
      setSaving(false);
    }
  };

  const resetEditing = () => {
    setFormData(createTaskDraft(task));
    setIsEditing(false);
    setSaveError("");
    setTitleError("");
    setDiscardIntent(null);
  };

  const requestCancelEditing = () => {
    if (isDirty) {
      setDiscardIntent("edit");
      return;
    }
    resetEditing();
  };

  const requestClose = () => {
    if (saving) return;
    if (isEditing && isDirty) {
      setDiscardIntent("close");
      return;
    }
    onClose?.();
  };

  const confirmDiscard = () => {
    const shouldClose = discardIntent === "close";
    resetEditing();
    if (shouldClose) onClose?.();
  };

  return (
    <Modal
      isOpen={Boolean(task)}
      onClose={requestClose}
      closeDisabled={saving}
      title={task ? `#${task.number} ${task.title}` : "Issue 詳細資料"}
      description={canEdit ? "檢視或更新 Issue 的負責人、優先順序與到期日。" : "檢視 Issue 的負責人、優先順序與到期日。"}
      maxWidth="max-w-2xl"
    >
      {task ? (
        <div className="space-y-6">
          {saveError ? <Alert tone="error" title="無法儲存變更">{saveError}</Alert> : null}
          {discardIntent ? (
            <div ref={discardPromptRef} tabIndex={-1} className="focus:outline-none">
              <Alert tone="info" title="尚有未儲存變更">
                <p>{discardIntent === "close" ? "關閉後將失去本次編輯內容。" : "取消編輯後將還原為目前已儲存的內容。"}</p>
                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button className="w-full sm:w-auto" variant="secondary" onClick={() => setDiscardIntent(null)}>繼續編輯</Button>
                  <Button className="w-full sm:w-auto" variant="danger" onClick={confirmDiscard}>
                    {discardIntent === "close" ? "放棄並關閉" : "放棄變更"}
                  </Button>
                </div>
              </Alert>
            </div>
          ) : null}
          {isEditing ? (
            <form onSubmit={handleSave} noValidate className="space-y-5" aria-busy={saving || undefined}>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="標題" htmlFor="task-title" required error={titleError} className="sm:col-span-2">
                  {({ describedBy, invalid }) => (
                    <input
                      ref={titleInputRef}
                      id="task-title"
                      className={inputClass}
                      value={formData.title}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      disabled={saving}
                      onChange={(event) => handleInputChange("title", event.target.value)}
                    />
                  )}
                </FormField>
                <FormField label="描述" htmlFor="task-description" className="sm:col-span-2">
                  <textarea id="task-description" rows={4} className={cn(inputClass, "min-h-28 py-3")} value={formData.description} disabled={saving} onChange={(event) => handleInputChange("description", event.target.value)} />
                </FormField>
                <FormField label="狀態" htmlFor="task-status">
                  <select id="task-status" className={inputClass} value={formData.statusId} disabled={saving} onChange={(event) => handleInputChange("statusId", event.target.value)}>
                    {statusOptions.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
                  </select>
                </FormField>
                <FormField label="優先順序" htmlFor="task-priority">
                  <select id="task-priority" className={inputClass} value={formData.priority} disabled={saving} onChange={(event) => handleInputChange("priority", event.target.value)}>
                    {ISSUE_PRIORITY_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </FormField>
                <FormField label="負責人" htmlFor="task-assignee">
                  <select id="task-assignee" className={inputClass} value={formData.assignee} disabled={saving} onChange={(event) => handleInputChange("assignee", event.target.value)}>
                    <option value="">未指派</option>
                    {team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                  </select>
                </FormField>
                <FormField label="到期日" htmlFor="task-due-date">
                  <input id="task-due-date" type="date" className={inputClass} value={formData.dueDate} disabled={saving} onChange={(event) => handleInputChange("dueDate", event.target.value)} />
                </FormField>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
                <Button className="w-full sm:w-auto" variant="secondary" disabled={saving} onClick={requestCancelEditing}>取消</Button>
                <Button className="w-full sm:w-auto" type="submit" disabled={saving}>{saving ? "儲存中…" : "儲存變更"}</Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge tone={getWorkflowStatusTone(task.statusId, statusOptions)}>{currentStatus?.label ?? getWorkflowStatusLabel(task.statusId)}</Badge>
                <Badge tone={priority.tone}>{priority.label}</Badge>
              </div>
              <section>
                <h3 className="text-sm font-semibold text-ink">描述</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-body">{task.description || "尚未提供描述。"}</p>
              </section>
              <dl className="grid gap-4 rounded-card bg-surface p-5 sm:grid-cols-2">
                <div><dt className="text-xs text-muted">負責人</dt><dd className="mt-1 text-sm font-semibold text-ink">{assigneeName || "未指派"}</dd></div>
                <div><dt className="text-xs text-muted">到期日</dt><dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink"><CalendarClock size={15} aria-hidden="true" />{task.dueDate ? new Date(task.dueDate).toLocaleDateString("zh-TW") : "未設定"}</dd></div>
                <div><dt className="text-xs text-muted">建立時間</dt><dd className="mt-1 text-sm text-body">{task.createdAt ? new Date(task.createdAt).toLocaleString("zh-TW") : "未知"}</dd></div>
                <div><dt className="text-xs text-muted">最後更新</dt><dd className="mt-1 text-sm text-body">{task.updatedAt ? new Date(task.updatedAt).toLocaleString("zh-TW") : "未知"}</dd></div>
              </dl>
              {canEdit ? (
                <div className="flex border-t border-line-soft pt-5 sm:justify-end">
                  <Button className="w-full sm:w-auto" variant="secondary" onClick={() => setIsEditing(true)}><Pencil size={16} aria-hidden="true" />編輯 Issue</Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
