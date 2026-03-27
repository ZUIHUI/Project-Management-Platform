import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../features/auth/authService";
import { validateLoginInput } from "../features/auth/credentialValidation";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateLoginInput(form.email, form.password);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await authService.login(form.email.trim(), form.password);
      navigate("/home");
    } catch (loginError) {
      setError(loginError?.response?.data?.error?.message ?? "登入失敗，請檢查帳號密碼");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-900">歡迎回來</h1>
        <p className="mt-2 text-sm text-slate-600">登入後即可管理專案、任務與儀表板。</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="you@company.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            密碼
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            {submitting ? "登入中..." : "登入"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <p className="mt-5 text-sm text-slate-600">
          還沒有帳號？
          <Link to="/register" className="ml-1 font-semibold text-blue-700 hover:text-blue-800">
            前往註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
