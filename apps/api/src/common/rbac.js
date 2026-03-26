const ROLE_ORDER = {
  viewer: 0,
  member: 1,
  project_admin: 2,
  org_admin: 3,
  owner: 4,
};

export const roleAtLeast = (role, minimum) => {
  return (ROLE_ORDER[role] ?? -1) >= (ROLE_ORDER[minimum] ?? Number.MAX_SAFE_INTEGER);
};

export const requireRole = (minimumRole) => {
  return (req, res, next) => {
    const role = req.currentRole || req.headers["x-role"] || "viewer";
    if (!roleAtLeast(role, minimumRole)) {
      res.status(403).json({ error: "Forbidden", requiredRole: minimumRole });
      return;
    }

    req.currentRole = role;
    next();
  };
};

export const requireAuthOrHeaderRole = (req, res, next) => {
  const role = req.currentRole || req.headers["x-role"] || "viewer";
  if (!role || role === "viewer") {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.currentRole = role;
  next();
};
