import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_EMAIL = "saitdndr51@gmail.com";

export default function AdminGuard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
