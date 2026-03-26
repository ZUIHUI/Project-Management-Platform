import { ROLE } from "../../config/constants.js";

const roleRank = {
  [ROLE.VIEWER]: 0,
  [ROLE.MEMBER]: 1,
  [ROLE.PROJECT_ADMIN]: 2,
  [ROLE.ORG_ADMIN]: 3,
  [ROLE.OWNER]: 4,
};

export const requireRole = (minRole) => (req, res, next) => {
  const role = req.headers["x-role"] ?? ROLE.VIEWER;
  if ((roleRank[role] ?? -1) < (roleRank[minRole] ?? 999)) {
    res.status(403).json({ error: "Forbidden", requiredRole: minRole, role });
    return;
  }

  req.currentRole = role;
  next();
};
