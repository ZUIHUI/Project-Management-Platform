import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../features/auth/authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await authService.register(form.name.trim(), form.email.trim(), form.password);
      navigate("/home");
    } catch (registerError) {
      setError(registerError?.response?.data?.error?.message ?? "註冊失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-900">建立帳號</h1>
        <p className="mt-2 text-sm text-slate-600">快速註冊後即可開始建立專案與任務。</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            姓名
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="王小明"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>

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
              placeholder="至少 8 碼"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            {submitting ? "建立中..." : "註冊帳號"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <p className="mt-5 text-sm text-slate-600">
          已經有帳號？
          <Link to="/login" className="ml-1 font-semibold text-blue-700 hover:text-blue-800">
            前往登入
          </Link>
        </p>
      </div>
    </div>
  );
}
