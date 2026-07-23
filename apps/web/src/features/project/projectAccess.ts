import { authService } from "../auth/authService";

export type ProjectAccessMode = "read" | "write" | "admin";

type ProjectLike = {
  ownerId?: string | null;
  members?: Array<{ userId?: string; role?: string }>;
};

const memberRoleRank: Record<string, number> = { viewer: 0, member: 1, project_admin: 2 };
const requiredMemberRank: Record<ProjectAccessMode, number> = { read: 0, write: 1, admin: 2 };
const requiredPlatformRole: Record<ProjectAccessMode, string> = { read: "viewer", write: "member", admin: "project_admin" };

export const canAccessProject = (project: ProjectLike | null | undefined, mode: ProjectAccessMode) => {
  const user = authService.getCurrentUser();
  if (!project || !user || !authService.hasRole(requiredPlatformRole[mode])) return false;
  if (authService.hasRole("org_admin") || project.ownerId === user.id) return true;
  const membership = project.members?.find((member) => member.userId === user.id);
  return (memberRoleRank[membership?.role ?? ""] ?? -1) >= requiredMemberRank[mode];
};
