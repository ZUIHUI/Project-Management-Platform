// @ts-check

import { formatProductDocumentTitle } from "../../shared/productPresentation.js";

const exactRouteLabels = new Map([
  ["/home", "總覽"],
  ["/dashboard", "營運儀表板"],
  ["/board", "看板"],
  ["/timeline", "時間軸"],
  ["/calendar", "行事曆"],
  ["/insights", "分析"],
  ["/workload", "工作負載"],
  ["/team", "團隊"],
  ["/activity", "活動紀錄"],
  ["/notifications", "通知"],
  ["/settings", "設定"],
]);

/** @param {string} pathname */
export const getWorkspaceRouteLabel = (pathname) => {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const exactLabel = exactRouteLabels.get(normalizedPath);
  if (exactLabel) return exactLabel;
  if (normalizedPath === "/projects") return "專案";
  if (/^\/projects\/[^/]+\/issues$/.test(normalizedPath)) return "Issue 清單";
  if (/^\/projects\/[^/]+\/board$/.test(normalizedPath)) return "專案看板";
  if (/^\/projects\/[^/]+\/sprint$/.test(normalizedPath)) return "Sprint 管理";
  if (/^\/projects\/[^/]+\/milestone$/.test(normalizedPath)) return "里程碑管理";
  if (/^\/projects\/[^/]+$/.test(normalizedPath)) return "專案工作區";
  return "找不到頁面";
};

/** @param {string} pathname */
export const getWorkspaceDocumentTitle = (pathname) => formatProductDocumentTitle(getWorkspaceRouteLabel(pathname));
