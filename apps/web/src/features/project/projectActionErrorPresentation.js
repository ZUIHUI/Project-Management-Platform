// @ts-check

import { getApiErrorDetails, getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";

/**
 * @param {unknown} error
 * @param {string} fallback
 * @returns {{ message: string, field: "" | "key" }}
 */
export const presentProjectCreateError = (error, fallback) => {
  const { message } = getApiErrorDetails(error);
  if (message === "Project key already exists") {
    return { message: "此專案代碼已存在，請改用其他代碼。", field: "key" };
  }
  if (message?.startsWith("project key must be")) {
    return {
      message: "專案代碼需為 2–12 個字元，以英文字母開頭，並只能使用大寫字母、數字、底線或連字號。",
      field: "key",
    };
  }
  return { message: getApiErrorMessage(error, fallback), field: "" };
};

/**
 * @param {unknown} error
 * @param {string} fallback
 * @returns {{ message: string, field: "" | "userId" }}
 */
export const presentTeamMemberError = (error, fallback) => {
  const { message } = getApiErrorDetails(error);
  if (message === "User not found") {
    return { message: "找不到這個帳號，請重新搜尋後再試。", field: "userId" };
  }
  return { message: getApiErrorMessage(error, fallback), field: "" };
};
