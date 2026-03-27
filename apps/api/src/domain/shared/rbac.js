import { ROLE } from '../../config/constants.js';
import { getTokenFromRequest, verifyAccessToken } from '../../common/auth.js';
import { db } from '../../data/db.js';
import { fail } from './http.js';

const roleRank = {
  [ROLE.VIEWER]: 0,
  [ROLE.MEMBER]: 1,
  [ROLE.PROJECT_ADMIN]: 2,
  [ROLE.ORG_ADMIN]: 3,
  [ROLE.OWNER]: 4,
};

const memberRoleRank = { viewer: 0, member: 1, project_admin: 2 };

const isPlatformAdmin = (role) => role === ROLE.OWNER || role === ROLE.ORG_ADMIN;

const canAccessProject = async ({ userId, role, projectId, mode }) => {
  if (!userId || !projectId) return false;
  if (isPlatformAdmin(role)) return true;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return false;
  if (project.ownerId === userId) return true;

  const member = await db.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
  if (!member) return false;

  if (mode === 'read') return memberRoleRank[member.role] >= memberRoleRank.viewer;
  if (mode === 'write') return memberRoleRank[member.role] >= memberRoleRank.member;
  return memberRoleRank[member.role] >= memberRoleRank.project_admin;
};

const resolveProjectIdFromIssue = async (issueId) => {
  const issue = await db.issue.findUnique({ where: { id: issueId }, select: { projectId: true } });
  return issue?.projectId ?? null;
};

export const requireRole = (minRole) => (req, res, next) => {
  const token = getTokenFromRequest(req);
  let role = req.currentRole || req.headers['x-role'] || ROLE.VIEWER;

  if (!req.currentRole && token) {
    const payload = verifyAccessToken(token);
    if (payload?.role) {
      role = payload.role;
      req.currentRole = role;
      req.currentUser = { id: payload.userId, role: payload.role };
    }
  }

  if ((roleRank[role] ?? -1) < (roleRank[minRole] ?? 999)) {
    return fail(res, 403, 'Forbidden', { requiredRole: minRole, role });
  }

  req.currentRole = role;
  next();
};

export const requireAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return fail(res, 401, 'Unauthorized: Missing token');

  const payload = verifyAccessToken(token);
  if (!payload) return fail(res, 401, 'Unauthorized: Invalid or expired token');

  req.currentUser = { id: payload.userId, role: payload.role };
  req.currentRole = payload.role;
  next();
};

export const requireProjectScope = ({ mode = 'read', source = 'project' } = {}) => async (req, res, next) => {
  const userId = req.currentUser?.id;
  const role = req.currentUser?.role ?? req.currentRole ?? ROLE.VIEWER;
  const projectId =
    source === 'issue' ? await resolveProjectIdFromIssue(req.params.issueId) : req.params.projectId ?? req.query.projectId;

  if (!projectId) return fail(res, 400, 'project scope is required');

  if (!(await canAccessProject({ userId, role, projectId, mode }))) {
    return fail(res, 403, 'Forbidden: project scope denied', { projectId, mode });
  }

  req.scope = { ...(req.scope ?? {}), projectId };
  next();
};
