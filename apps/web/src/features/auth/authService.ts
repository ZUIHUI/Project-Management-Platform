import axiosInstance from "../../services/axiosInstance";
import { safeStorage } from "../../shared/storage";

const ACCESS_TOKEN_KEY = "pmp.accessToken";
const REFRESH_TOKEN_KEY = "pmp.refreshToken";
const CURRENT_USER_KEY = "pmp.currentUser";
const ROLE_RANK: Record<string, number> = {
  viewer: 0,
  member: 1,
  project_admin: 2,
  org_admin: 3,
  owner: 4,
};

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
};

const unwrapAuthPayload = (response: { data?: AuthPayload | { data?: AuthPayload } }) => {
  if (!response.data) {
    return null;
  }

  if ("accessToken" in response.data) {
    return response.data as AuthPayload;
  }

  return response.data.data ?? null;
};

const persistAuth = (payload: AuthPayload) => {
  safeStorage.set(ACCESS_TOKEN_KEY, payload.accessToken);
  safeStorage.set(REFRESH_TOKEN_KEY, payload.refreshToken);
  safeStorage.set(CURRENT_USER_KEY, JSON.stringify(payload.user));
};

export const authService = {
  accessTokenKey: ACCESS_TOKEN_KEY,

  async login(email: string, password: string) {
    this.logout();
    const response = await axiosInstance.post("/login", { email, password });
    const payload = unwrapAuthPayload(response);
    if (!payload) {
      throw new Error("登入回應格式錯誤");
    }
    persistAuth(payload);
    return payload;
  },

  async register(name: string, email: string, password: string) {
    const response = await axiosInstance.post("/register", { name, email, password, role: "member" });
    const payload = unwrapAuthPayload(response);
    if (!payload) {
      throw new Error("註冊回應格式錯誤");
    }
    persistAuth(payload);
    return payload;
  },


  async getProfile() {
    const response = await axiosInstance.get("/me");
    return response.data;
  },

  async updateProfile(name: string, email: string) {
    const response = await axiosInstance.put("/me", { name, email });
    if (response.data?.user) {
      const updatedUser = {
        id: response.data.user.id,
        name: response.data.user.name,
        role: response.data.user.role,
      };
      safeStorage.set(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await axiosInstance.post("/change-password", { currentPassword, newPassword });
    return response.data;
  },

  logout() {
    safeStorage.remove(ACCESS_TOKEN_KEY);
    safeStorage.remove(REFRESH_TOKEN_KEY);
    safeStorage.remove(CURRENT_USER_KEY);
  },

  isAuthenticated() {
    const token = safeStorage.get(ACCESS_TOKEN_KEY);
    const user = this.getCurrentUser();
    return Boolean(token && user?.id);
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
};
