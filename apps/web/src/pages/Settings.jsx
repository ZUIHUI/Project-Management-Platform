import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, LoadingState, PageHeader } from "../components/ui";
import PasswordSettingsCard from "../features/auth/components/PasswordSettingsCard";
import ProfileSettingsCard from "../features/auth/components/ProfileSettingsCard";
import RoleSummaryCard from "../features/auth/components/RoleSummaryCard";
import { useSettingsWorkspace } from "../features/auth/useSettingsWorkspace";

export default function Settings() {
  const navigate = useNavigate();
  const workspace = useSettingsWorkspace();
  const accountMutationBusy = workspace.profileSaving || workspace.passwordSaving;

  const handleChangePassword = async (currentPassword, newPassword) => {
    const result = await workspace.changePassword(currentPassword, newPassword);
    if (result.ok) {
      navigate("/login", { replace: true, state: { notice: "密碼已更新，請使用新密碼重新登入。" } });
    }
    return result;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader eyebrow="帳號與安全" title="帳號設定" description="管理個人資料、登入安全與目前的角色權限。" />

      {workspace.loadError ? (
        <Alert tone="error" title="無法載入帳號設定">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{workspace.loadError}</span>
            <Button variant="outline" size="sm" onClick={workspace.refresh}><RefreshCw size={16} aria-hidden="true" />重新載入</Button>
          </div>
        </Alert>
      ) : null}

      {workspace.loading ? <Card><LoadingState label="載入帳號設定中…" /></Card> : null}

      {!workspace.loading && workspace.profile ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="xl:col-start-1 xl:row-start-1">
            <ProfileSettingsCard
              profile={workspace.profile}
              saving={workspace.profileSaving}
              busy={accountMutationBusy}
              error={workspace.profileError}
              errorField={workspace.profileErrorField}
              notice={workspace.profileNotice}
              onClearFeedback={workspace.clearProfileFeedback}
              onSave={workspace.updateProfile}
            />
          </div>
          <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-stretch">
            <RoleSummaryCard role={workspace.profile.role} />
          </div>
          <div className="xl:col-start-1 xl:row-start-2">
            <PasswordSettingsCard
              saving={workspace.passwordSaving}
              busy={accountMutationBusy}
              error={workspace.passwordError}
              errorField={workspace.passwordErrorField}
              onClearError={workspace.clearPasswordError}
              onChangePassword={handleChangePassword}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
