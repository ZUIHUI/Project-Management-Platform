import { useEffect, useRef, useState } from "react";
import { KeyRound } from "lucide-react";
import { Alert, Button, Card, CardHeader, FormField } from "../../../components/ui";
import PasswordInput from "./PasswordInput";
import { PASSWORD_POLICY_TEXT, validatePasswordChangeInput } from "../credentialValidation";

const emptyDraft = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function PasswordSettingsCard({ saving, error, errorField, onClearError, onChangePassword }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState({});
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const updateDraft = (field, value) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    onClearError?.();
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const focusField = (field) => {
    if (field === "currentPassword") currentPasswordRef.current?.focus();
    if (field === "newPassword") newPasswordRef.current?.focus();
    if (field === "confirmPassword") confirmPasswordRef.current?.focus();
  };

  useEffect(() => {
    if (saving || !error) return;
    if (errorField === "currentPassword") currentPasswordRef.current?.focus();
    if (errorField === "newPassword") newPasswordRef.current?.focus();
  }, [error, errorField, saving]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validatePasswordChangeInput(draft.currentPassword, draft.newPassword, draft.confirmPassword);
    setFieldErrors(nextErrors);
    const firstInvalidField = ["currentPassword", "newPassword", "confirmPassword"].find((field) => nextErrors[field]);
    if (firstInvalidField) {
      focusField(firstInvalidField);
      return;
    }
    await onChangePassword(draft.currentPassword, draft.newPassword);
  };

  const currentPasswordError = fieldErrors.currentPassword || (errorField === "currentPassword" ? error : "");
  const newPasswordError = fieldErrors.newPassword || (errorField === "newPassword" ? error : "");
  const confirmPasswordError = fieldErrors.confirmPassword || (errorField === "confirmPassword" ? error : "");

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="變更密碼"
        description="更新後會登出所有既有登入狀態，並要求使用新密碼重新登入。"
        action={<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong text-ink"><KeyRound size={18} aria-hidden="true" /></span>}
      />
      <form className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6" onSubmit={handleSubmit} noValidate aria-busy={saving || undefined}>
        {error && !errorField ? <Alert tone="error" title="無法更新密碼" className="sm:col-span-2">{error}</Alert> : null}

        <FormField label="目前密碼" htmlFor="current-password" error={currentPasswordError} required className="sm:col-span-2">
          {({ describedBy, invalid }) => <PasswordInput ref={currentPasswordRef} id="current-password" autoComplete="current-password" value={draft.currentPassword} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateDraft("currentPassword", event.target.value)} disabled={saving} required />}
        </FormField>
        <FormField label="新密碼" htmlFor="new-password" hint={PASSWORD_POLICY_TEXT} error={newPasswordError} required>
          {({ describedBy, invalid }) => <PasswordInput ref={newPasswordRef} id="new-password" autoComplete="new-password" value={draft.newPassword} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateDraft("newPassword", event.target.value)} minLength={8} maxLength={64} disabled={saving} required />}
        </FormField>
        <FormField label="確認新密碼" htmlFor="confirm-password" error={confirmPasswordError} required>
          {({ describedBy, invalid }) => <PasswordInput ref={confirmPasswordRef} id="confirm-password" autoComplete="new-password" value={draft.confirmPassword} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateDraft("confirmPassword", event.target.value)} minLength={8} maxLength={64} disabled={saving} required />}
        </FormField>

        <div className="flex justify-end border-t border-line-soft pt-5 sm:col-span-2">
          <Button className="w-full sm:w-auto" type="submit" disabled={saving || !draft.currentPassword || !draft.newPassword || !draft.confirmPassword}>
            {saving ? "更新中…" : "更新密碼並重新登入"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
