import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../../features/auth/authService";
import { useAuthStatus } from "../../features/auth/useAuthStatus";

export default function GuestOnly({ children }) {
  const authenticated = useAuthStatus();

  useEffect(() => {
    if (!authenticated) authService.logout();
  }, [authenticated]);

  if (authenticated) return <Navigate to="/home" replace />;
  return children;
}
