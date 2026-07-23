import { apiClient, apiRequest } from "../../shared/api/client";
import type { components } from "../../shared/api/schema";
import { safeStorage } from "../../shared/storage";
import {
  ACCESS_TOKEN_KEY,
  AUTH_CHANGE_EVENT,
  CURRENT_USER_KEY,
  REFRESH_TOKEN_KEY,
  clearStoredAuthSession,
  getSessionEndReason,
  isTokenExpired,
  notifyAuthChange,
  persistStoredAuthSession,
} from "../../shared/authSession";
const ROLE_RANK: Record<string, number> = {
  viewer: 0,
  member: 1,
  project_admin: 2,
  org_admin: 3,
  owner: 4,
};

type AuthPayload = components["schemas"]["AuthSession"];

const persistAuth = (payload: AuthPayload) => {
  persistStoredAuthSession(payload.accessToken, payload.refreshToken, payload.user);
};

export const authService = {
  accessTokenKey: ACCESS_TOKEN_KEY,

  async login(email: string, password: string) {
    this.logout();
    const response = await apiRequest(apiClient.POST("/login", { body: { email, password } }));
    persistAuth(response.data);
    return response.data;
  },

  async register(name: string, email: string, password: string) {
    const response = await apiRequest(apiClient.POST("/register", { body: { name, email, password } }));
    persistAuth(response.data);
    return response.data;
  },

  async getProfile() {
    return (await apiRequest(apiClient.GET("/me"))).data;
  },

  async updateProfile(name: string, email: string) {
    const response = await apiRequest(apiClient.PUT("/me", { body: { name, email } }));
    if (response.data?.user) {
      const updatedUser = {
        id: response.data.user.id,
        name: response.data.user.name,
        role: response.data.user.role,
      };
      safeStorage.set(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      notifyAuthChange();
    }
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return (
      await apiRequest(
        apiClient.POST("/change-password", { body: { currentPassword, newPassword } }),
      )
    ).data;
  },

  logout() {
    clearStoredAuthSession();
  },

  invalidateSession() {
    clearStoredAuthSession("expired");
  },

  hasStoredSession() {
    return Boolean(
      safeStorage.get(ACCESS_TOKEN_KEY) ||
      safeStorage.get(REFRESH_TOKEN_KEY) ||
      safeStorage.get(CURRENT_USER_KEY),
    );
  },

  getSessionEndReason,

  isAuthenticated() {
    const token = safeStorage.get(ACCESS_TOKEN_KEY);
    const user = this.getCurrentUser();
    if (!token || !user?.id) return false;
    if (!isTokenExpired(token)) return true;

    const refreshToken = safeStorage.get(REFRESH_TOKEN_KEY);
    return Boolean(refreshToken && !isTokenExpired(refreshToken));
  },

  getCurrentUser() {
    const raw = safeStorage.get(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.id || !parsed?.role) return null;
      return parsed as { id: string; name: string; role: string };
    } catch {
      return null;
    }
  },

  hasRole(minRole: string) {
    const currentRole = this.getCurrentUser()?.role ?? "viewer";
    return (ROLE_RANK[currentRole] ?? -1) >= (ROLE_RANK[minRole] ?? 999);
  },

  subscribe(listener: () => void) {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, listener);
  },
};
