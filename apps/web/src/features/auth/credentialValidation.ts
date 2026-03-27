const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_POLICY_TEXT =
  "密碼需為 8-64 字元，且至少包含 1 個大寫英文字母、1 個小寫英文字母、1 個數字";

export const validateLoginInput = (email: string, password: string) => {
  if (!email.trim() || !password.trim()) {
    return "請輸入 Email 與密碼";
  }

  if (!EMAIL_PATTERN.test(email.trim().toLowerCase())) {
    return "Email 格式不正確";
  }

  return "";
};

export const validateRegisterInput = (name: string, email: string, password: string) => {
  if (name.trim().length < 2 || name.trim().length > 50) {
    return "姓名長度需介於 2 到 50 字元";
  }

  const loginError = validateLoginInput(email, password);
  if (loginError) {
    return loginError;
  }

  if (password.length < 8 || password.length > 64 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return PASSWORD_POLICY_TEXT;
  }

  return "";
};
