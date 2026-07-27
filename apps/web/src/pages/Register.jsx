import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, Button, FormField } from "../components/ui";
import { inputClass } from "../components/ui/styles";
import { authService } from "../features/auth/authService";
import { getAuthErrorDetails } from "../features/auth/authErrorMessages";
import PasswordInput from "../features/auth/components/PasswordInput";
import { PASSWORD_POLICY_TEXT, validateRegisterFields } from "../features/auth/credentialValidation";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fieldRefs = {
    name: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  const updateForm = (field, value) => {
    setFormError("");
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "password" ? { confirmPassword: undefined } : {}),
    }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const focusField = (field) => fieldRefs[field]?.current?.focus();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateRegisterFields(form.name, form.email, form.password, form.confirmPassword);
    const firstInvalidField = ["name", "email", "password", "confirmPassword"].find((field) => validationErrors[field]);
    if (firstInvalidField) {
      setFieldErrors(validationErrors);
      setFormError("");
      focusField(firstInvalidField);
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});
      setFormError("");
      await authService.register(form.name.trim(), form.email.trim(), form.password);
      navigate("/home", { replace: true });
    } catch (registerError) {
      const details = getAuthErrorDetails(registerError, "無法建立帳號，請稍後再試。");
      if (details.field) {
        setFieldErrors({ [details.field]: details.message });
        focusField(details.field);
      } else {
        setFormError(details.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="建立平台帳號"
      title="建立你的帳號"
      description="完成註冊後即可建立專案並邀請團隊開始協作。"
      footer={<>已經有帳號？<Link to="/login" className="ml-1 inline-flex min-h-11 items-center rounded-control font-semibold text-brand hover:text-brand-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">返回登入</Link></>}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate aria-busy={submitting || undefined}>
        <FormField label="姓名" htmlFor="register-name" error={fieldErrors.name} required>
          {({ describedBy, invalid }) => (
            <input ref={fieldRefs.name} id="register-name" type="text" autoComplete="name" className={inputClass} placeholder="你的姓名" value={form.name} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateForm("name", event.target.value)} minLength={2} maxLength={50} disabled={submitting} required />
          )}
        </FormField>
        <FormField label="Email" htmlFor="register-email" error={fieldErrors.email} required>
          {({ describedBy, invalid }) => (
            <input ref={fieldRefs.email} id="register-email" type="email" autoComplete="email" className={inputClass} placeholder="you@company.com" value={form.email} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateForm("email", event.target.value)} disabled={submitting} required />
          )}
        </FormField>
        <FormField label="密碼" htmlFor="register-password" hint={PASSWORD_POLICY_TEXT} error={fieldErrors.password} required>
          {({ describedBy, invalid }) => (
            <PasswordInput ref={fieldRefs.password} id="register-password" autoComplete="new-password" placeholder="至少 8 個字元" value={form.password} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateForm("password", event.target.value)} minLength={8} maxLength={64} disabled={submitting} required />
          )}
        </FormField>
        <FormField label="確認密碼" htmlFor="register-confirm-password" error={fieldErrors.confirmPassword} required>
          {({ describedBy, invalid }) => (
            <PasswordInput ref={fieldRefs.confirmPassword} id="register-confirm-password" autoComplete="new-password" placeholder="再次輸入密碼" value={form.confirmPassword} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateForm("confirmPassword", event.target.value)} minLength={8} maxLength={64} disabled={submitting} required />
          )}
        </FormField>
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "建立中…" : "建立帳號"}
          {!submitting ? <ArrowRight size={18} aria-hidden="true" /> : null}
        </Button>
      </form>
    </AuthLayout>
  );
}
