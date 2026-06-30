import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const isAuth = !!localStorage.getItem("WORKER_URL");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
