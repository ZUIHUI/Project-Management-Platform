import { useEffect, useRef, useState } from "react";
import Modal from "../../../components/Modal";
import { Alert, Button, FormField } from "../../../components/ui";
import { inputClass } from "../../../components/ui/styles";
import { PROJECT_ROLES } from "./teamRoles";

const emptyDraft = { userId: "", role: "member" };

export default function TeamMemberDialog({ isOpen, projectName, onClose, onAdd, saving, error, errorField, onClearError }) {
  const [draft, setDraft] = useState(emptyDraft);
  const userIdRef = useRef(null);

  useEffect(() => {
    if (isOpen) onClearError?.();
  }, [isOpen, onClearError]);

  useEffect(() => {
    if (isOpen && errorField === "userId") userIdRef.current?.focus();
  }, [errorField, isOpen]);

  const closeDialog = () => {
    if (saving) return;
    setDraft(emptyDraft);
    onClearError?.();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.userId.trim() || saving) return;
    const added = await onAdd(draft.userId, draft.role);
    if (added) {
      setDraft(emptyDraft);
      onClose?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeDialog} closeDisabled={saving} title="新增專案成員" description={`將既有帳號加入「${projectName}」，並設定最小必要權限。`}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && !errorField ? <Alert tone="error" title="無法新增成員">{error}</Alert> : null}
        <FormField label="使用者 ID" htmlFor="team-user-id" hint="目前系統尚未提供帳號搜尋，請輸入已存在帳號的完整使用者 ID。" error={errorField === "userId" ? error : ""} required>
          {({ describedBy, invalid }) => (
            <input
              ref={userIdRef}
              id="team-user-id"
              className={inputClass}
              value={draft.userId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              onChange={(event) => {
                if (errorField === "userId") onClearError?.();
                setDraft((current) => ({ ...current, userId: event.target.value }));
              }}
              placeholder="例如：user-dev"
              autoComplete="off"
              autoFocus
              required
            />
          )}
        </FormField>
        <FormField label="專案角色" htmlFor="team-role" hint={PROJECT_ROLES.find((role) => role.value === draft.role)?.description}>
          <select id="team-role" className={inputClass} value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))}>
            {PROJECT_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
          </select>
        </FormField>
        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeDialog} disabled={saving}>取消</Button>
          <Button type="submit" disabled={saving || !draft.userId.trim()}>{saving ? "新增中…" : "新增成員"}</Button>
        </div>
      </form>
    </Modal>
  );
}
