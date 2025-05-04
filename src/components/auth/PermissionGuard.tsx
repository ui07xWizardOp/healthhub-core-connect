
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: ('isAdmin' | 'isStaff' | 'isDoctor' | 'isCustomer')[];
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on user roles and permissions
 * 
 * @example
 * <PermissionGuard requiredRoles={['Admin']} fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallback = null 
}) => {
  const { hasRole, isAdmin, isStaff, isDoctor, isCustomer } = useAuth();
  
  // Check if the user has any of the required roles
  const hasRequiredRole = requiredRoles.length === 0 || 
                         requiredRoles.some(role => hasRole(role)) || 
                         isAdmin();
  
  // Check if the user has any of the required permissions
  const hasRequiredPermission = requiredPermissions.length === 0 ||
                               requiredPermissions.some(permission => {
                                 switch (permission) {
                                   case 'isAdmin': return isAdmin();
                                   case 'isStaff': return isStaff();
                                   case 'isDoctor': return isDoctor();
                                   case 'isCustomer': return isCustomer();
                                   default: return false;
                                 }
                               }) ||
                               isAdmin();
  
  if (hasRequiredRole && hasRequiredPermission) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default PermissionGuard;
