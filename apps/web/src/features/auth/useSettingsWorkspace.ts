import { useCallback, useEffect, useState } from "react";
import { getApiErrorDetails, getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import type { components } from "../../shared/api/schema";
import { authService } from "./authService";

type Profile = components["schemas"]["AuthUser"];
export type SettingsErrorField = "name" | "email" | "currentPassword" | "newPassword" | null;
export type SettingsMutationResult = { ok: true; field: null } | { ok: false; field: SettingsErrorField };

const getSettingsError = (error: unknown, fallback: string): { message: string; field: SettingsErrorField } => {
  const { message } = getApiErrorDetails(error);
  if (message === "Name must be at least 2 characters" || message === "name length must be between 2 and 50 characters") {
    return { message: "姓名長度需介於 2 到 50 個字元。", field: "name" };
  }
  if (message === "A valid email is required" || message === "email format is invalid") {
    return { message: "Email 格式不正確。", field: "email" };
  }
  if (message === "Email already in use") return { message: "此 Email 已被其他帳號使用。", field: "email" };
  if (message === "Current password is incorrect") return { message: "目前密碼不正確。", field: "currentPassword" };
  if (message?.startsWith("Password must be")) return { message: "新密碼不符合安全規則。", field: "newPassword" };
  return { message: getApiErrorMessage(error, fallback), field: null };
};

export const useSettingsWorkspace = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileErrorField, setProfileErrorField] = useState<SettingsErrorField>(null);
  const [profileNotice, setProfileNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordErrorField, setPasswordErrorField] = useState<SettingsErrorField>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await authService.getProfile();
      const user = data.user as Profile | undefined;
      if (!user) throw new Error("帳號回應沒有個人資料。");
      setProfile(user);
    } catch (profileLoadError) {
      setProfile(null);
      setLoadError(getSettingsError(profileLoadError, "無法載入帳號設定。").message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (name: string, email: string): Promise<SettingsMutationResult> => {
    if (!name.trim() || !email.trim()) return { ok: false, field: !name.trim() ? "name" : "email" };
    setProfileSaving(true);
    setProfileError("");
    setProfileErrorField(null);
    setProfileNotice("");
    try {
      const data = await authService.updateProfile(name.trim(), email.trim());
      const updated = data.user as Profile | undefined;
      if (!updated) throw new Error("個人資料已更新，但伺服器未回傳帳號資料。請重新載入確認結果。");
      setProfile(updated);
      setProfileNotice("個人資料已更新。");
      return { ok: true, field: null };
    } catch (updateError) {
      const mappedError = getSettingsError(updateError, "更新個人資料失敗。");
      setProfileError(mappedError.message);
      setProfileErrorField(mappedError.field);
      return { ok: false, field: mappedError.field };
    } finally {
      setProfileSaving(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<SettingsMutationResult> => {
    if (!currentPassword || !newPassword) return { ok: false, field: !currentPassword ? "currentPassword" : "newPassword" };
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordErrorField(null);
    try {
      await authService.changePassword(currentPassword, newPassword);
      authService.logout();
      return { ok: true, field: null };
    } catch (changeError) {
      const mappedError = getSettingsError(changeError, "更新密碼失敗。");
      setPasswordError(mappedError.message);
      setPasswordErrorField(mappedError.field);
      return { ok: false, field: mappedError.field };
    } finally {
      setPasswordSaving(false);
    }
  }, []);
  const clearProfileFeedback = useCallback(() => {
    setProfileError("");
    setProfileErrorField(null);
    setProfileNotice("");
  }, []);
  const clearPasswordError = useCallback(() => {
    setPasswordError("");
    setPasswordErrorField(null);
  }, []);

  return {
    profile,
    loading,
    profileSaving,
    passwordSaving,
    loadError,
    profileError,
    profileErrorField,
    profileNotice,
    passwordError,
    passwordErrorField,
    refresh: loadProfile,
    clearProfileFeedback,
    clearPasswordError,
    updateProfile,
    changePassword,
  };
};
