import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session || session.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
