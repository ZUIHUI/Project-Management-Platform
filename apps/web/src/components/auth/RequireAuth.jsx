import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../features/auth/authService";

export default function RequireAuth({ children, minRole = "viewer" }) {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    authService.logout();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!authService.hasRole(minRole)) {
    return <Navigate to="/home" replace state={{ denied: location.pathname }} />;
  }

  return children;
}
