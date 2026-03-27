import { useEffect, useState } from "react";
import { authService } from "../features/auth/authService";
import { PASSWORD_POLICY_TEXT } from "../features/auth/credentialValidation";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data.user ?? null);
      } catch (profileError) {
        setError(profileError?.response?.data?.error?.message ?? "無法載入帳號設定");
      }
    };

    loadProfile();
  }, []);

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("請填寫目前密碼與新密碼");
      return;
    }

    try {
      setError("");
      setMessage("");
      const data = await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMessage(data.message ?? "密碼已更新");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (changePasswordError) {
      setError(changePasswordError?.response?.data?.error?.message ?? "更新密碼失敗");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-600">帳號資訊與密碼管理。</p>
      </div>

      {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

      <section className="rounded border p-4">
        <h2 className="font-semibold">目前帳號</h2>
        {profile ? (
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>姓名：{profile.name}</li>
            <li>Email：{profile.email}</li>
            <li>角色：{profile.role}</li>
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">載入中...</p>
        )}
      </section>

      <section className="rounded border p-4">
        <h2 className="font-semibold">變更密碼</h2>
        <p className="mt-1 text-xs text-gray-500">{PASSWORD_POLICY_TEXT}</p>
        <form className="mt-3 grid gap-2 md:grid-cols-2" onSubmit={handleChangePassword}>
          <input
            type="password"
            className="rounded border px-3 py-2"
            placeholder="目前密碼"
            value={passwordForm.currentPassword}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
          />
          <input
            type="password"
            className="rounded border px-3 py-2"
            placeholder="新密碼"
            value={passwordForm.newPassword}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
          />
          <button className="rounded bg-blue-600 px-4 py-2 text-white md:col-span-2" type="submit">更新密碼</button>
        </form>
      </section>
    </div>
  );
}
