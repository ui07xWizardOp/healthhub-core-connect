
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: ('isAdmin' | 'isStaff' | 'isDoctor' | 'isCustomer')[];
  allowUnauthorized?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  allowUnauthorized = false
}) => {
  const { user, loading, userProfile, hasRole, isAdmin, isStaff, isDoctor, isCustomer } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && !allowUnauthorized) {
      console.log('No user detected, redirecting to login');
    }
  }, [user, loading, allowUnauthorized]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-healthhub-orange" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !allowUnauthorized) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // At this point, the user is authenticated or we're allowing unauthenticated access
  // Now check roles and permissions
  if (user && userProfile) {
    // Check required roles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole && !isAdmin()) {
        toast.error('You do not have permission to access this page');
        return <Navigate to="/dashboard" replace />;
      }
    }

    // Check required permissions
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = requiredPermissions.some(permission => {
        switch (permission) {
          case 'isAdmin': return isAdmin();
          case 'isStaff': return isStaff();
          case 'isDoctor': return isDoctor();
          case 'isCustomer': return isCustomer();
          default: return false;
        }
      });

      if (!hasRequiredPermission && !isAdmin()) {
        toast.error('You do not have permission to access this page');
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
