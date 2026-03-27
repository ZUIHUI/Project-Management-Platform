export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 64,
  requireLowercase: true,
  requireUppercase: true,
  requireDigit: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_POLICY_TEXT =
  "密碼需為 8-64 字元，且至少包含 1 個大寫英文字母、1 個小寫英文字母、1 個數字";

export const validateRegisterPayload = ({ name, email, password }) => {
  const normalizedName = `${name ?? ""}`.trim();
  const normalizedEmail = `${email ?? ""}`.trim().toLowerCase();
  const rawPassword = `${password ?? ""}`;

  if (normalizedName.length < 2 || normalizedName.length > 50) {
    return { error: "name length must be between 2 and 50 characters", status: 422 };
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { error: "email format is invalid", status: 422 };
  }

  if (rawPassword.length < PASSWORD_POLICY.minLength || rawPassword.length > PASSWORD_POLICY.maxLength) {
    return { error: PASSWORD_POLICY_TEXT, status: 422 };
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(rawPassword)) {
    return { error: PASSWORD_POLICY_TEXT, status: 422 };
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(rawPassword)) {
    return { error: PASSWORD_POLICY_TEXT, status: 422 };
  }

  if (PASSWORD_POLICY.requireDigit && !/[0-9]/.test(rawPassword)) {
    return { error: PASSWORD_POLICY_TEXT, status: 422 };
  }

  return {
    name: normalizedName,
    email: normalizedEmail,
    password: rawPassword,
  };
};

export const validateLoginPayload = (email, password) => {
  const normalizedEmail = `${email ?? ""}`.trim().toLowerCase();
  const rawPassword = `${password ?? ""}`;

  if (!normalizedEmail || !rawPassword) {
    return { error: "email and password are required", status: 422 };
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { error: "email format is invalid", status: 422 };
  }

  return { email: normalizedEmail, password: rawPassword };
};
