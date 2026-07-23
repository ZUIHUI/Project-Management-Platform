import { ROLE, type Role } from '../../config/constants.js';

const roleRank: Record<Role, number> = {
  [ROLE.VIEWER]: 0,
  [ROLE.MEMBER]: 1,
  [ROLE.PROJECT_ADMIN]: 2,
  [ROLE.ORG_ADMIN]: 3,
  [ROLE.OWNER]: 4,
};

const memberRoleRank = { viewer: 0, member: 1, project_admin: 2 } as const;
export type ProjectMemberRole = keyof typeof memberRoleRank;
export type ProjectAccessMode = 'read' | 'write' | 'admin';
export interface AuthenticatedUser {
  id: string;
  role: Role;
  tokenVersion: number;
}

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && Object.values(ROLE).includes(value as Role);

export const roleAtLeast = (role: Role, minimum: Role) => roleRank[role] >= roleRank[minimum];
export const isPlatformAdmin = (role: Role) => role === ROLE.OWNER || role === ROLE.ORG_ADMIN;

export const memberCan = (role: string, mode: ProjectAccessMode) => {
  const rank = memberRoleRank[role as ProjectMemberRole] ?? -1;
  if (mode === 'read') return rank >= memberRoleRank.viewer;
  if (mode === 'write') return rank >= memberRoleRank.member;
  return rank >= memberRoleRank.project_admin;
};

export const isProjectMemberRole = (value: unknown): value is ProjectMemberRole =>
  typeof value === 'string' && value in memberRoleRank;
