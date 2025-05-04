
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type PermissionsContextType = {
  canViewDashboard: boolean;
  canViewPharmacy: boolean;
  canViewLaboratory: boolean;
  canViewCustomers: boolean;
  canViewInventory: boolean;
  canViewEmployees: boolean;
  canViewSettings: boolean;
  canEditMedication: boolean;
  canEditLabTest: boolean;
  canEditCustomer: boolean;
  canEditEmployee: boolean;
  getAvailableRoutes: () => { path: string; name: string; icon: string }[];
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isStaff, isDoctor, userProfile, hasRole } = useAuth();
  
  // Basic page access permissions
  const canViewDashboard = !!userProfile;
  const canViewPharmacy = isAdmin() || isStaff() || hasRole('LabTechnician');
  const canViewLaboratory = isAdmin() || isStaff() || hasRole('LabTechnician');
  const canViewCustomers = isAdmin() || isStaff() || isDoctor();
  const canViewInventory = isAdmin() || isStaff();
  const canViewEmployees = isAdmin();
  const canViewSettings = isAdmin() || isStaff();
  
  // Specific action permissions
  const canEditMedication = isAdmin() || isStaff();
  const canEditLabTest = isAdmin() || hasRole('LabTechnician');
  const canEditCustomer = isAdmin() || isStaff();
  const canEditEmployee = isAdmin();

  // Get available routes based on user permissions
  const getAvailableRoutes = () => {
    const routes = [];
    
    if (canViewDashboard) {
      routes.push({ path: '/dashboard', name: 'Dashboard', icon: 'LayoutDashboard' });
    }
    
    if (canViewPharmacy) {
      routes.push({ path: '/pharmacy', name: 'Pharmacy', icon: 'PillIcon' });
    }
    
    if (canViewLaboratory) {
      routes.push({ path: '/laboratory', name: 'Laboratory', icon: 'TestTube' });
    }
    
    if (canViewCustomers) {
      routes.push({ path: '/customers', name: 'Customers', icon: 'Users' });
    }
    
    if (canViewInventory) {
      routes.push({ path: '/inventory', name: 'Inventory', icon: 'ShoppingCart' });
    }
    
    if (canViewEmployees) {
      routes.push({ path: '/employees', name: 'Employees', icon: 'User' });
    }
    
    if (canViewSettings) {
      routes.push({ path: '/settings', name: 'Settings', icon: 'Settings' });
    }
    
    return routes;
  };
  
  const value = {
    canViewDashboard,
    canViewPharmacy,
    canViewLaboratory,
    canViewCustomers,
    canViewInventory,
    canViewEmployees,
    canViewSettings,
    canEditMedication,
    canEditLabTest,
    canEditCustomer,
    canEditEmployee,
    getAvailableRoutes
  };
  
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
