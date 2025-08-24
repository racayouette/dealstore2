import { useEffect } from "react";
import { useLocation } from "wouter";
import { isAdminAuthenticated } from "@/lib/auth";
import { Loader2, Shield } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      setLocation('/wp-admin');
    }
  }, [setLocation]);

  if (!isAdminAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin authentication to access this page.</p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">Redirecting to login...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}