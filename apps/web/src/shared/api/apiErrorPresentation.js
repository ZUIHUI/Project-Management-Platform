// @ts-check

/** @type {Readonly<Record<string, string>>} */
const productMessages = Object.freeze({
  "Project not found": "找不到指定專案，或你已無權存取。",
  "Issue not found": "找不到指定 Issue，內容可能已移除或不在目前專案範圍。",
  "Notification not found": "找不到指定通知，內容可能已更新。",
  "User not found": "找不到指定使用者，請確認帳號後再試。",
  Forbidden: "你沒有執行這項操作的權限。",
  "title is required": "請輸入 Issue 標題。",
  "body is required": "請輸入留言內容。",
  "assignee is not in project scope": "選取的負責人不在目前專案中。",
  "Unknown status": "找不到指定的工作狀態。",
  "Invalid status transition": "目前流程不允許切換到這個狀態。",
  "startAt must be earlier than endAt": "結束日期必須晚於開始日期。",
  "Cannot archive project with unfinished high priority issues": "此專案仍有未完成的高優先 Issue，完成或調整後才能封存。",
  "Project key already exists": "此專案代碼已存在，請改用其他代碼。",
  "message or payload is required": "請輸入提醒內容。",
  "Account role is invalid": "帳號角色設定異常，請聯絡平台管理員。",
});

const networkMessagePattern = /failed to fetch|network error|load failed|fetch failed|econnrefused/i;
const sessionMessagePattern = /unauthorized|invalid or expired (?:access )?token|refresh token has been revoked|invalid or expired refresh token/i;
/** @param {string} value */
const containsCjk = (value) => /[\u3400-\u9fff]/u.test(value);

/** @param {unknown} error */
export const getApiErrorDetails = (error) => {
  const responseError = /** @type {{ response?: { status?: number, data?: { error?: { message?: string } | string } }, message?: string }} */ (error);
  const responseValue = responseError.response?.data?.error;
  return {
    status: responseError.response?.status,
    message: (typeof responseValue === "string" ? responseValue : responseValue?.message) ?? responseError.message ?? "",
  };
};

/**
 * Convert transport and API failures into stable product language. Unknown
 * backend text deliberately falls back instead of exposing internal English.
 * @param {unknown} error
 * @param {string} fallback
 */
export const getApiErrorMessage = (error, fallback) => {
  const { message, status } = getApiErrorDetails(error);
  if (message.startsWith("project key must be")) {
    return "專案代碼需為 2–12 個字元，以英文字母開頭，並只能使用大寫字母、數字、底線或連字號。";
  }
  if (productMessages[message]) return productMessages[message];
  if (status === 401 || sessionMessagePattern.test(message)) return "登入狀態已失效，請重新登入後繼續。";
  if (status === 403) return "你沒有執行這項操作的權限。";
  if (status === 429) return "操作過於頻繁，請稍後再試。";
  if ((status && status >= 500) || networkMessagePattern.test(message)) {
    return "目前無法連線至平台服務，請稍後重新整理。";
  }
  if (message && containsCjk(message)) return message;
  return fallback;
};
