import { ROLE } from "../../config/constants.js";
import { getTokenFromRequest, verifyAccessToken } from "../../common/auth.js";

const roleRank = {
  [ROLE.VIEWER]: 0,
  [ROLE.MEMBER]: 1,
  [ROLE.PROJECT_ADMIN]: 2,
  [ROLE.ORG_ADMIN]: 3,
  [ROLE.OWNER]: 4,
};

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
