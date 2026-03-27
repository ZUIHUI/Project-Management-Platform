import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../features/auth/authService";

export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
