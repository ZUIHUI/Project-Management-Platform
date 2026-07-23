import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../features/auth/authService";
import { useAuthStatus } from "../../features/auth/useAuthStatus";

export default function RequireAuth({ children, minRole = "viewer" }) {
  const location = useLocation();
  const authenticated = useAuthStatus();
  const hasStoredSession = authService.hasStoredSession();
  const sessionExpired = authService.getSessionEndReason() === "expired" || hasStoredSession;

  useEffect(() => {
    if (!authenticated && hasStoredSession) authService.invalidateSession();
  }, [authenticated, hasStoredSession]);

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          notice: sessionExpired ? "登入狀態已過期，請重新登入後繼續原本的工作。" : undefined,
          noticeTone: sessionExpired ? "info" : undefined,
        }}
      />
    );
  }

  if (!authService.hasRole(minRole)) {
    return <Navigate to="/home" replace state={{ denied: location.pathname }} />;
  }

  return children;
}
