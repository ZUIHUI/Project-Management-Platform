import { useEffect, useMemo, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { Alert, Button, Card, CardHeader, FormField } from "../../../components/ui";
import { inputClass } from "../../../components/ui/styles";
import { validateProfileInput } from "../credentialValidation";

const draftFromProfile = (profile) => ({ name: profile?.name ?? "", email: profile?.email ?? "" });

export default function ProfileSettingsCard({ profile, saving, error, errorField, notice, onClearFeedback, onSave }) {
  const [draft, setDraft] = useState(() => draftFromProfile(profile));
  const [fieldErrors, setFieldErrors] = useState({});
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    setDraft(draftFromProfile(profile));
    setFieldErrors({});
  }, [profile]);

  const dirty = useMemo(() => (
    draft.name.trim() !== profile.name || draft.email.trim().toLowerCase() !== (profile.email ?? "").toLowerCase()
  ), [draft, profile]);

  const updateDraft = (field, value) => {
    onClearFeedback?.();
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const focusField = (field) => {
    if (field === "name") nameRef.current?.focus();
    if (field === "email") emailRef.current?.focus();
  };

  useEffect(() => {
    if (saving || !error) return;
    if (errorField === "name") nameRef.current?.focus();
    if (errorField === "email") emailRef.current?.focus();
  }, [error, errorField, saving]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!dirty || saving) return;
    const nextErrors = validateProfileInput(draft.name, draft.email);
    setFieldErrors(nextErrors);
    const firstInvalidField = ["name", "email"].find((field) => nextErrors[field]);
    if (firstInvalidField) {
      focusField(firstInvalidField);
      return;
    }
    await onSave(draft.name, draft.email);
  };

  const nameError = fieldErrors.name || (errorField === "name" ? error : "");
  const emailError = fieldErrors.email || (errorField === "email" ? error : "");

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="個人資料"
        description="這些資訊會顯示在帳號與團隊協作介面。"
        action={<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong text-ink"><UserRound size={18} aria-hidden="true" /></span>}
      />
      <form className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6" onSubmit={handleSubmit} noValidate aria-busy={saving || undefined}>
        {error && !errorField ? <Alert tone="error" title="無法儲存個人資料" className="sm:col-span-2">{error}</Alert> : null}
        {notice ? <Alert tone="success" className="sm:col-span-2">{notice}</Alert> : null}

        <FormField label="姓名" htmlFor="settings-name" hint="2–50 個字元。" error={nameError} required>
          {({ describedBy, invalid }) => <input
              ref={nameRef}
              id="settings-name"
              className={inputClass}
              autoComplete="name"
              minLength={2}
              maxLength={50}
              value={draft.name}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              onChange={(event) => updateDraft("name", event.target.value)}
              disabled={saving}
              required
            />}
        </FormField>
        <FormField label="Email" htmlFor="settings-email" error={emailError} required>
          {({ describedBy, invalid }) => <input
              ref={emailRef}
              id="settings-email"
              type="email"
              className={inputClass}
              autoComplete="email"
              value={draft.email}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              onChange={(event) => updateDraft("email", event.target.value)}
              disabled={saving}
              required
            />}
        </FormField>

        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted" aria-live="polite">{dirty ? "尚有未儲存的變更。" : "資料已是最新狀態。"}</p>
          <Button className="w-full sm:w-auto" type="submit" disabled={saving || !dirty || !draft.name.trim() || !draft.email.trim()}>
            {saving ? "儲存中…" : "儲存個人資料"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
