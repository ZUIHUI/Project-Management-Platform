// @ts-check

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_POLICY_TEXT =
  "密碼需為 8-64 字元，且至少包含 1 個大寫英文字母、1 個小寫英文字母、1 個數字";

/** @typedef {{ email?: string, password?: string }} LoginFieldErrors */
/** @typedef {{ name?: string, email?: string, password?: string, confirmPassword?: string }} RegisterFieldErrors */

/**
 * @param {string} email
 * @param {string} password
 * @returns {LoginFieldErrors}
 */
export const validateLoginFields = (email, password) => {
  /** @type {LoginFieldErrors} */
  const errors = {};
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) errors.email = "請輸入 Email。";
  else if (!EMAIL_PATTERN.test(normalizedEmail)) errors.email = "Email 格式不正確。";
  if (!password.trim()) errors.password = "請輸入密碼。";

  return errors;
};

/**
 * @param {string} email
 * @param {string} password
 */
export const validateLoginInput = (email, password) => {
  const errors = validateLoginFields(email, password);
  if (errors.email && errors.password) return "請輸入 Email 與密碼";
  return errors.email?.replace(/。$/, "") ?? errors.password?.replace(/。$/, "") ?? "";
};

/** @param {string} password */
export const validateNewPassword = (password) => {
  if (
    password.length < 8 ||
    password.length > 64 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return PASSWORD_POLICY_TEXT;
  }
  return "";
};

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export const validateRegisterInput = (name, email, password) => {
  const errors = validateRegisterFields(name, email, password);
  if (errors.name) return "姓名長度需介於 2 到 50 字元";
  return (errors.name ?? errors.email ?? errors.password ?? "").replace(/。$/, "");
};

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string | undefined} [confirmPassword]
 * @returns {RegisterFieldErrors}
 */
export const validateRegisterFields = (name, email, password, confirmPassword) => {
  /** @type {RegisterFieldErrors} */
  const errors = {};
  const normalizedName = name.trim();
  const loginErrors = validateLoginFields(email, password);

  if (normalizedName.length < 2 || normalizedName.length > 50) {
    errors.name = "姓名長度需介於 2 到 50 個字元。";
  }
  if (loginErrors.email) errors.email = loginErrors.email;
  if (loginErrors.password) errors.password = loginErrors.password;
  else {
    const passwordError = validateNewPassword(password);
    if (passwordError) errors.password = `${passwordError}。`;
  }
  if (confirmPassword !== undefined) {
    if (!confirmPassword) errors.confirmPassword = "請再次輸入密碼。";
    else if (password !== confirmPassword) errors.confirmPassword = "密碼與確認密碼不一致。";
  }

  return errors;
};

/**
 * @typedef {{ name?: string, email?: string }} ProfileFieldErrors
 * @param {string} name
 * @param {string} email
 * @returns {ProfileFieldErrors}
 */
export const validateProfileInput = (name, email) => {
  /** @type {ProfileFieldErrors} */
  const errors = {};
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedName.length < 2 || normalizedName.length > 50) {
    errors.name = "姓名長度需介於 2 到 50 個字元。";
  }
  if (!normalizedEmail) errors.email = "請輸入 Email。";
  else if (!EMAIL_PATTERN.test(normalizedEmail)) errors.email = "Email 格式不正確。";

  return errors;
};

/**
 * @typedef {{ currentPassword?: string, newPassword?: string, confirmPassword?: string }} PasswordFieldErrors
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {string} confirmPassword
 * @returns {PasswordFieldErrors}
 */
export const validatePasswordChangeInput = (currentPassword, newPassword, confirmPassword) => {
  /** @type {PasswordFieldErrors} */
  const errors = {};

  if (!currentPassword) errors.currentPassword = "請輸入目前密碼。";
  const passwordError = validateNewPassword(newPassword);
  if (passwordError) errors.newPassword = passwordError;
  if (!confirmPassword) errors.confirmPassword = "請再次輸入新密碼。";
  else if (newPassword !== confirmPassword) errors.confirmPassword = "新密碼與確認密碼不一致。";

  return errors;
};
