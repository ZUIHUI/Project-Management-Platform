import { useEffect, useState } from "react";
import { UserRound, Users } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState } from "../../../components/ui";
import { inputClass } from "../../../components/ui/styles";
import { presentProjectMember } from "../projectMemberPresentation";
import { getProjectRoleLabel, PROJECT_ROLES } from "./teamRoles";

function MemberRow({ member, canManage, onSaveRole, saving }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(member.role ?? "viewer");
  const userId = member.userId ?? "未知使用者";
  const identity = presentProjectMember(member);

  useEffect(() => {
    if (!editing) setRole(member.role ?? "viewer");
  }, [editing, member.role]);

  const save = async () => {
    const updated = await onSaveRole(userId, role);
    if (updated) setEditing(false);
  };

  return (
    <article className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-strong font-semibold text-ink">{identity.initial}</span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{identity.displayName}</h3>
          {identity.email ? <p className="mt-1 truncate text-xs text-muted">{identity.email}</p> : null}
          {identity.hasReadableName ? <p className="mt-1 truncate font-mono text-xs text-muted">ID: {identity.userId}</p> : <p className="mt-1 text-xs text-muted">專案成員 ID</p>}
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor={`member-role-${userId}`}>角色</label>
          <select id={`member-role-${userId}`} className={`${inputClass} sm:w-48`} value={role} onChange={(event) => setRole(event.target.value)} disabled={saving}>
            {PROJECT_ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || role === member.role}>{saving ? "儲存中…" : "儲存"}</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>取消</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Badge tone={member.role === "project_admin" ? "brand" : "neutral"}>{getProjectRoleLabel(member.role)}</Badge>
          {canManage ? <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>變更角色</Button> : null}
        </div>
      )}
    </article>
  );
}

export default function TeamMemberList({ members, selectedProjectId, canManage, busyMemberIds, onSaveRole, onAddMember }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="專案成員" description={`${members.length} 位成員`} />
      {members.length ? (
        <div className="divide-y divide-line-soft">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              canManage={canManage}
              onSaveRole={onSaveRole}
              saving={busyMemberIds.includes(member.userId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={selectedProjectId ? Users : UserRound}
          title={selectedProjectId ? "此專案尚無成員" : "沒有可顯示的專案"}
          description={selectedProjectId ? "專案管理員可用使用者 ID 加入第一位成員。" : "建立或加入專案後即可管理團隊。"}
          action={canManage && selectedProjectId ? <Button onClick={onAddMember}>新增成員</Button> : null}
        />
      )}
    </Card>
  );
}
