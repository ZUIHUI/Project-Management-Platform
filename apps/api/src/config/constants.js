export const API_PREFIX = "/api/v1";
export const PORT = Number(process.env.PORT || 3000);

export const STATUS = {
  TODO: "todo",
  DOING: "doing",
  DONE: "done",
};

export const ROLE = {
  VIEWER: "viewer",
  MEMBER: "member",
  PROJECT_ADMIN: "project_admin",
  ORG_ADMIN: "org_admin",
  OWNER: "owner",
};
