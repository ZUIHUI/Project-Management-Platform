import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";

const authErrorMessages: Record<string, string> = {
  "Invalid credentials": "Email 或密碼不正確。",
  "User already exists": "此 Email 已建立帳號，請直接登入。",
  "Name must be at least 2 characters": "姓名至少需要 2 個字元。",
  "A valid email is required": "請輸入有效的 Email。",
  "Email already in use": "此 Email 已由其他帳號使用。",
  "name length must be between 2 and 50 characters": "姓名長度需介於 2 到 50 字元。",
  "email format is invalid": "Email 格式不正確。",
  "email and password are required": "請輸入 Email 與密碼。",
  "Password must be 8-64 characters and include lowercase, uppercase, and a digit.":
    "密碼需為 8-64 字元，且至少包含 1 個大寫英文字母、1 個小寫英文字母、1 個數字。",
};

export type AuthErrorField = "name" | "email" | "password";

const authErrorFields: Partial<Record<string, AuthErrorField>> = {
  "User already exists": "email",
  "Name must be at least 2 characters": "name",
  "A valid email is required": "email",
  "Email already in use": "email",
  "name length must be between 2 and 50 characters": "name",
  "email format is invalid": "email",
  "Password must be 8-64 characters and include lowercase, uppercase, and a digit.": "password",
};

const getResponseMessage = (error: unknown) => {
  const responseError = error as {
    response?: { data?: { error?: { message?: string } | string } };
  };
  const responseMessage = responseError.response?.data?.error;
  return typeof responseMessage === "string" ? responseMessage : responseMessage?.message;
};

export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  const message = getResponseMessage(error);
  return (message && authErrorMessages[message]) ?? getApiErrorMessage(error, fallback);
};

export const getAuthErrorDetails = (error: unknown, fallback: string) => {
  const responseMessage = getResponseMessage(error);
  return {
    message: (responseMessage && authErrorMessages[responseMessage]) ?? getApiErrorMessage(error, fallback),
    field: responseMessage ? authErrorFields[responseMessage] : undefined,
  };
};
