import { Navigate, Outlet } from "react-router-dom";
import { getTokenFromCookie } from "../../utils/tokenUtils";

export default function ProtectedRoute() {
  const token = getTokenFromCookie();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
