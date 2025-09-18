import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  requireAuth = true,
  redirectTo = "/login"
}: RouteGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
    }
  }, [isAuthenticated, requireAuth, redirectTo, setLocation]);

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-lg font-medium mb-4">Authentication required</div>
              <p className="text-gray-600 mb-6">Please login to access this page</p>
              <div className="space-x-4">
                <Button onClick={() => setLocation("/login")}>
                  Login
                </Button>
                <Button variant="outline" onClick={() => setLocation("/")}>
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}