export const PROJECT_ROLES = [
  { value: "viewer", label: "檢視者", description: "可查看專案與進度，不可修改內容。" },
  { value: "member", label: "協作者", description: "可建立、指派與更新 Issue。" },
  { value: "project_admin", label: "專案管理員", description: "可管理專案成員與權限。" },
];

export const getProjectRoleLabel = (role) => PROJECT_ROLES.find((item) => item.value === role)?.label ?? role;
