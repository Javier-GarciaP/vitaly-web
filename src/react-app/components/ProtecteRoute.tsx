import { Navigate, Outlet } from "react-router";
import { useAuthState } from "react-firebase-hooks/auth"; // Opcional pero recomendado
import { auth } from "@/react-app/lib/firebase";

export default function ProtectedRoute() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-slate-200"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}