export const API_PREFIX = '/api/v1';

export const STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

export const ROLE = {
  VIEWER: 'viewer',
  MEMBER: 'member',
  PROJECT_ADMIN: 'project_admin',
  ORG_ADMIN: 'org_admin',
  OWNER: 'owner',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

// Public registration remains self-service for project creators in this MVP.
// The server owns this decision; callers cannot select their own role.
export const SELF_REGISTRATION_ROLE: Role = ROLE.PROJECT_ADMIN;
