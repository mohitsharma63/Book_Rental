import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function RouteGuard({ children, requireAuth = false, requireAdmin = false }: RouteGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give some time for AuthContext to load user from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading) {
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
    }
  }, [requireAuth, requireAdmin, isAuthenticated, user, setLocation, isLoading]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if requirements are not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && (!isAuthenticated || user?.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}