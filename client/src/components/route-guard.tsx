
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function RouteGuard({ children, requireAuth = false, requireAdmin = false }: RouteGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If authentication is required but user is not logged in
    if (requireAuth && !isAuthenticated) {
      setLocation("/login");
      return;
    }

    // If admin access is required but user is not admin
    if (requireAdmin && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/");
      return;
    }
  }, [requireAuth, requireAdmin, isAuthenticated, user, setLocation]);

  // Don't render children if requirements are not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && (!isAuthenticated || user?.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
