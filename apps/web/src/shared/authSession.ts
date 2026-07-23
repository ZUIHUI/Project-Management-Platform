import { safeStorage } from "./storage";

export const ACCESS_TOKEN_KEY = "pmp.accessToken";
export const REFRESH_TOKEN_KEY = "pmp.refreshToken";
export const CURRENT_USER_KEY = "pmp.currentUser";
export const AUTH_CHANGE_EVENT = "pmp-auth-change";
export type SessionEndReason = "expired" | null;

let sessionEndReason: SessionEndReason = null;

export const notifyAuthChange = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const persistStoredAuthSession = (accessToken: string, refreshToken: string, user: unknown) => {
  sessionEndReason = null;
  safeStorage.set(ACCESS_TOKEN_KEY, accessToken);
  safeStorage.set(REFRESH_TOKEN_KEY, refreshToken);
  safeStorage.set(CURRENT_USER_KEY, JSON.stringify(user));
  notifyAuthChange();
};

export const clearStoredAuthSession = (reason: SessionEndReason = null) => {
  sessionEndReason = reason;
  safeStorage.remove(ACCESS_TOKEN_KEY);
  safeStorage.remove(REFRESH_TOKEN_KEY);
  safeStorage.remove(CURRENT_USER_KEY);
  notifyAuthChange();
};

export const updateStoredAccessToken = (accessToken: string) => {
  sessionEndReason = null;
  safeStorage.set(ACCESS_TOKEN_KEY, accessToken);
  notifyAuthChange();
};

export const getSessionEndReason = () => sessionEndReason;

export const isTokenExpired = (token: string) => {
  const segments = token.split(".");
  if (segments.length !== 3) return false;
  const payloadSegment = segments[1];
  if (!payloadSegment) return true;

  try {
    const encoded = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const payload = JSON.parse(globalThis.atob(padded)) as { exp?: unknown };
    return typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};
