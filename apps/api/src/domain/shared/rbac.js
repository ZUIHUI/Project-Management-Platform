import { ROLE } from "../../config/constants.js";
import { getTokenFromRequest, verifyAccessToken } from "../../common/auth.js";
import { db } from "../../data/inMemoryDB.js";

const roleRank = {
  [ROLE.VIEWER]: 0,
  [ROLE.MEMBER]: 1,
  [ROLE.PROJECT_ADMIN]: 2,
  [ROLE.ORG_ADMIN]: 3,
  [ROLE.OWNER]: 4,
};

const memberRoleRank = {
  viewer: 0,
  member: 1,
  project_admin: 2,
};

const isPlatformAdmin = (role) => role === ROLE.OWNER || role === ROLE.ORG_ADMIN;

const canAccessProject = ({ userId, role, projectId, mode }) => {
  if (!userId || !projectId) {
    return false;
  }

  if (isPlatformAdmin(role)) {
    return true;
  }

  const project = db.projects.find((item) => item.id === projectId);
  if (!project) {
    return false;
  }

  if (project.ownerId === userId) {
    return true;
  }

  const member = db.projectMembers.find((item) => item.projectId === projectId && item.userId === userId);
  if (!member) {
    return false;
  }

  if (mode === "read") {
    return memberRoleRank[member.role] >= memberRoleRank.viewer;
  }

  if (mode === "write") {
    return memberRoleRank[member.role] >= memberRoleRank.member;
  }

  return memberRoleRank[member.role] >= memberRoleRank.project_admin;
};

const resolveProjectIdFromIssue = (issueId) => db.issues.find((item) => item.id === issueId)?.projectId ?? null;

export const requireRole = (minRole) => (req, res, next) => {
  const token = getTokenFromRequest(req);
  let role = req.currentRole || req.headers["x-role"] || ROLE.VIEWER;

  if (!req.currentRole && token) {
    const payload = verifyAccessToken(token);
    if (payload && payload.role) {
      role = payload.role;
      req.currentRole = role;
      req.currentUser = { id: payload.userId, role: payload.role };
    }
  }

  if ((roleRank[role] ?? -1) < (roleRank[minRole] ?? 999)) {
    res.status(403).json({ error: "Forbidden", requiredRole: minRole, role });
    return;
  }

  req.currentRole = role;
  next();
};

export const requireAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }

  req.currentUser = { id: payload.userId, role: payload.role };
  req.currentRole = payload.role;
  next();
};

export const requireProjectScope = ({ mode = "read", source = "project" } = {}) => (req, res, next) => {
  const userId = req.currentUser?.id;
  const role = req.currentUser?.role ?? req.currentRole ?? ROLE.VIEWER;
  const projectId =
    source === "issue" ? resolveProjectIdFromIssue(req.params.issueId) : req.params.projectId ?? req.query.projectId;

  if (!projectId) {
    return res.status(400).json({ error: { message: "project scope is required", status: 400 } });
  }

  if (!canAccessProject({ userId, role, projectId, mode })) {
    return res.status(403).json({
      error: {
        message: "Forbidden: project scope denied",
        status: 403,
        projectId,
        mode,
      },
    });
  }

  req.scope = { ...(req.scope ?? {}), projectId };
  next();
};
