import { useEffect, useRef, useState } from "react";
import Modal from "../../../components/Modal";
import { Alert, Button, FormField, MutationForm } from "../../../components/ui";
import { inputClass } from "../../../components/ui/styles";
import { getSprintEndDateError } from "../projectPlanningValidation.js";

const emptyDraft = { name: "", goal: "", dueAt: "", startAt: "", endAt: "" };

const toIsoDate = (value, endOfDay = false) => value
  ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
  : undefined;

export default function ProjectPlanningDialog({ kind, projectName, isOpen, onClose, onCreate, saving, error, onClearError, showSchedule = false }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [endDateError, setEndDateError] = useState("");
  const endDateRef = useRef(null);
  const milestone = kind === "milestone";
  const title = milestone ? "新增里程碑" : "新增 Sprint";

  useEffect(() => {
    if (isOpen) {
      setEndDateError("");
      onClearError?.();
    }
  }, [isOpen, onClearError]);

  const closeDialog = () => {
    if (saving) return;
    setDraft(emptyDraft);
    setEndDateError("");
    onClearError?.();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.name.trim() || saving) return;
    const scheduleError = milestone ? "" : getSprintEndDateError(draft.startAt, draft.endAt);
    if (scheduleError) {
      setEndDateError(scheduleError);
      endDateRef.current?.focus();
      return;
    }
    setEndDateError("");
    const payload = milestone
      ? { name: draft.name, dueAt: toIsoDate(draft.dueAt, true) }
      : {
          name: draft.name,
          goal: draft.goal,
          startAt: toIsoDate(draft.startAt),
          endAt: toIsoDate(draft.endAt, true) ?? null,
        };
    const created = await onCreate(payload);
    if (created) {
      setDraft(emptyDraft);
      onClose?.();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDialog}
      closeDisabled={saving}
      title={title}
      description={`加入「${projectName}」的${milestone ? "可驗收交付節點" : "下一段團隊工作週期"}。`}
    >
      <MutationForm busy={saving} className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error ? <Alert tone="error" title={`無法${title}`}>{error}</Alert> : null}

        <FormField label={milestone ? "里程碑名稱" : "Sprint 名稱"} htmlFor={`planning-${kind}-name`} required>
          <input
            id={`planning-${kind}-name`}
            className={inputClass}
            value={draft.name}
            placeholder={milestone ? "例如：公開測試版上線" : "例如：Sprint 12"}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            autoFocus
            required
          />
        </FormField>

        {milestone ? (
          <FormField label="預計完成日期" htmlFor="planning-milestone-due" hint="選填；日期未確認時可稍後在里程碑管理中補上。">
            <input
              id="planning-milestone-due"
              type="date"
              className={inputClass}
              value={draft.dueAt}
              onChange={(event) => setDraft((current) => ({ ...current, dueAt: event.target.value }))}
            />
          </FormField>
        ) : (
          <>
            {showSchedule ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="開始日期" htmlFor="planning-sprint-start">
                  <input id="planning-sprint-start" type="date" className={inputClass} value={draft.startAt} onChange={(event) => { setEndDateError(""); setDraft((current) => ({ ...current, startAt: event.target.value })); }} />
                </FormField>
                <FormField label="結束日期" htmlFor="planning-sprint-end" error={endDateError}>
                  {({ describedBy, invalid }) => (
                    <input
                      ref={endDateRef}
                      id="planning-sprint-end"
                      type="date"
                      className={inputClass}
                      min={draft.startAt || undefined}
                      value={draft.endAt}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      onChange={(event) => { setEndDateError(""); setDraft((current) => ({ ...current, endAt: event.target.value })); }}
                    />
                  )}
                </FormField>
              </div>
            ) : null}
            <FormField label="Sprint 目標" htmlFor="planning-sprint-goal" hint="選填；用一句話說清楚這個週期要完成的成果。">
              <input
                id="planning-sprint-goal"
                className={inputClass}
                value={draft.goal}
                placeholder="例如：完成行動版 Issue 建立與狀態更新流程"
                onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value }))}
              />
            </FormField>
          </>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeDialog}>取消</Button>
          <Button type="submit" disabled={!draft.name.trim()}>{saving ? "建立中…" : title}</Button>
        </div>
      </MutationForm>
    </Modal>
  );
}
