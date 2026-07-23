import { useSyncExternalStore } from "react";
import { authService } from "./authService";

const getSnapshot = () => {
  const user = authService.getCurrentUser();
  return user ? `${user.id}|${user.name}|${user.role}` : "";
};

export const useCurrentUser = () => {
  useSyncExternalStore(authService.subscribe, getSnapshot, () => "");
  return authService.getCurrentUser();
};
