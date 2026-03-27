import axiosInstance from "../../services/axiosInstance";
import { safeStorage } from "../../shared/storage";

const ACCESS_TOKEN_KEY = "pmp.accessToken";
const REFRESH_TOKEN_KEY = "pmp.refreshToken";
const CURRENT_USER_KEY = "pmp.currentUser";

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

  logout() {
    safeStorage.remove(ACCESS_TOKEN_KEY);
    safeStorage.remove(REFRESH_TOKEN_KEY);
    safeStorage.remove(CURRENT_USER_KEY);
  },

  isAuthenticated() {
    return Boolean(safeStorage.get(ACCESS_TOKEN_KEY));
  },
};
