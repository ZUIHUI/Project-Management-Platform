import { useEffect, useState } from "react";
import { authService } from "../features/auth/authService";
import { PASSWORD_POLICY_TEXT } from "../features/auth/credentialValidation";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authService.getProfile();
        const user = data.user ?? null;
        setProfile(user);
        setProfileForm({ name: user?.name ?? "", email: user?.email ?? "" });
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

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setError("請填寫姓名與 Email");
      return;
    }

    try {
      setError("");
      setMessage("");
      const data = await authService.updateProfile(profileForm.name.trim(), profileForm.email.trim());
      setProfile(data.user ?? null);
      setMessage("個人帳號資料已更新");
    } catch (updateProfileError) {
      setError(updateProfileError?.response?.data?.error?.message ?? "更新個人資料失敗");
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
          <form className="mt-2 grid gap-2 md:grid-cols-2" onSubmit={handleUpdateProfile}>
            <input
              className="rounded border px-3 py-2"
              value={profileForm.name}
              placeholder="姓名"
              onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              className="rounded border px-3 py-2"
              value={profileForm.email}
              placeholder="Email"
              onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <p className="text-sm text-gray-700 md:col-span-2">角色：{profile.role}</p>
            <button className="rounded bg-slate-800 px-4 py-2 text-white md:col-span-2" type="submit">儲存個人資料</button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-gray-500">載入中...</p>
        )}
      </section>

      <section className="rounded border p-4">
        <h2 className="font-semibold">頁面權限與角色</h2>
        <p className="mt-1 text-sm text-gray-600">登入後將依角色顯示功能選單。</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>viewer：Home、Projects、Settings</li>
          <li>member：可再使用 Dashboard、Notifications</li>
          <li>project_admin / org_admin / owner：含 member 權限並可於後台管理專案角色</li>
        </ul>
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
