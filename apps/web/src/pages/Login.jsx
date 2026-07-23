import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, Button, FormField } from "../components/ui";
import { inputClass } from "../components/ui/styles";
import { authService } from "../features/auth/authService";
import { getAuthErrorDetails } from "../features/auth/authErrorMessages";
import { validateLoginFields } from "../features/auth/credentialValidation";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const noticeTone = location.state?.noticeTone === "info" ? "info" : "success";

  const updateForm = (field, value) => {
    setFormError("");
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const focusField = (field) => {
    if (field === "email") emailRef.current?.focus();
    if (field === "password") passwordRef.current?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateLoginFields(form.email, form.password);
    const firstInvalidField = ["email", "password"].find((field) => validationErrors[field]);
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
      await authService.login(form.email.trim(), form.password);
      navigate(location.state?.from || "/home", { replace: true });
    } catch (loginError) {
      const details = getAuthErrorDetails(loginError, "登入失敗，請確認 Email 與密碼。");
      if (details.field === "email" || details.field === "password") {
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
      eyebrow="歡迎回來"
      title="登入平台"
      description="繼續追蹤專案、協調工作並完成下一個交付目標。"
      footer={<>還沒有帳號？<Link to="/register" className="ml-1 inline-flex min-h-11 items-center rounded-control font-semibold text-brand hover:text-brand-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">建立帳號</Link></>}
    >
      {location.state?.notice ? <Alert tone={noticeTone} className="mb-5">{location.state.notice}</Alert> : null}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormField label="Email" htmlFor="login-email" error={fieldErrors.email} required>
          {({ describedBy, invalid }) => (
            <input ref={emailRef} id="login-email" type="email" autoComplete="email" className={inputClass} placeholder="you@company.com" value={form.email} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateForm("email", event.target.value)} required />
          )}
        </FormField>
        <FormField label="密碼" htmlFor="login-password" error={fieldErrors.password} required>
          {({ describedBy, invalid }) => (
            <input ref={passwordRef} id="login-password" type="password" autoComplete="current-password" className={inputClass} placeholder="輸入密碼" value={form.password} aria-describedby={describedBy} aria-invalid={invalid} onChange={(event) => updateForm("password", event.target.value)} required />
          )}
        </FormField>
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "登入中…" : "登入"}
          {!submitting ? <ArrowRight size={18} aria-hidden="true" /> : null}
        </Button>
      </form>
    </AuthLayout>
  );
}
