const isBrowser = typeof window !== "undefined";

export const safeStorage = {
  get(key: string) {
    if (!isBrowser) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore storage errors to avoid runtime crash
    }
  },
  remove(key: string) {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore storage errors to avoid runtime crash
    }
  },
};
