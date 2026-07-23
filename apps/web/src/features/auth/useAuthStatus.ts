import { useSyncExternalStore } from "react";
import { authService } from "./authService";

const getSnapshot = () => authService.isAuthenticated();

export const useAuthStatus = () =>
  useSyncExternalStore(authService.subscribe, getSnapshot, () => false);
