// @ts-check

export const PRODUCT_NAME = "Project Management Platform";
export const PRODUCT_SHORT_NAME = "專案交付平台";
export const PRODUCT_MARK = "PM";

/** @type {Readonly<Record<string, { label: string, description: string }>>} */
const platformRoles = Object.freeze({
  viewer: {
    label: "檢視者",
    description: "可查看被授權的專案與基本設定。",
  },
  member: {
    label: "協作者",
    description: "可建立與更新專案內工作。",
  },
  project_admin: {
    label: "專案管理員",
    description: "可管理專案、成員與交付設定。",
  },
  org_admin: {
    label: "組織管理員",
    description: "可管理組織與跨專案資源。",
  },
  owner: {
    label: "平台擁有者",
    description: "擁有平台完整管理權限。",
  },
});

/** @param {string} context */
export const formatProductDocumentTitle = (context) => `${context} · ${PRODUCT_SHORT_NAME}`;

/** @param {string} role */
export const getPlatformRoleLabel = (role) => platformRoles[role]?.label ?? "自訂角色";

/** @param {string} role */
export const getPlatformRoleDescription = (role) => (
  platformRoles[role]?.description ?? "你的功能範圍由組織管理員設定。"
);
