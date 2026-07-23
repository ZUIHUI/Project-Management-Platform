import type { RequestHandler } from 'express';
import { canAccessProject, resolveProjectIdFromIssue } from '../../../application/access/projectAccess.js';
import { isRole, roleAtLeast, type ProjectAccessMode } from '../../../domain/access/accessPolicy.js';
import type { Role } from '../../../config/constants.js';
import { db } from '../../../infrastructure/persistence/index.js';
import { getTokenFromRequest, verifyAccessToken } from '../../../infrastructure/security/auth.js';
import { fail, routeParam } from '../httpResponse.js';

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return void fail(res, 401, 'Unauthorized: Missing token');

    const payload = verifyAccessToken(token);
    if (!payload) return void fail(res, 401, 'Unauthorized: Invalid or expired token');

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, tokenVersion: true },
    });
    if (!user || !isRole(user.role) || user.tokenVersion !== payload.tokenVersion) {
      return void fail(res, 401, 'Unauthorized: Session revoked');
    }

    req.currentUser = { id: user.id, role: user.role, tokenVersion: user.tokenVersion };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (minimumRole: Role): RequestHandler => (req, res, next) => {
  const actor = req.currentUser;
  if (!actor || !roleAtLeast(actor.role, minimumRole)) {
    return void fail(res, 403, 'Forbidden', { requiredRole: minimumRole, role: actor?.role ?? null });
  }
  next();
};

export const requireProjectScope = (
  { mode = 'read', source = 'project' }: { mode?: ProjectAccessMode; source?: 'project' | 'issue' } = {},
): RequestHandler => async (req, res, next) => {
  try {
    const actor = req.currentUser;
    if (!actor) return void fail(res, 401, 'Unauthorized');

    const projectId =
      source === 'issue'
        ? await resolveProjectIdFromIssue(routeParam(req.params.issueId))
        : routeParam(req.params.projectId) || (typeof req.query.projectId === 'string' ? req.query.projectId : undefined);
    if (!projectId) return void fail(res, 400, 'project scope is required');
    if (!(await canAccessProject(actor, projectId, mode))) {
      return void fail(res, 403, 'Forbidden: project scope denied', { projectId, mode });
    }

    req.scope = { projectId };
    next();
  } catch (error) {
    next(error);
  }
};
