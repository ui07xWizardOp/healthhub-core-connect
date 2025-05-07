
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import LabTechnicianDashboard from '@/components/dashboard/LabTechnicianDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import DashboardSelector from '@/components/dashboard/DashboardSelector';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { userProfile, isAdmin, isStaff, isDoctor, isCustomer, hasRole } = useAuth();

  const renderDashboardByRole = () => {
    // Admin gets their special dashboard selector
    if (isAdmin()) {
      return <DashboardSelector />;
    }

    // Staff dashboard for staff users and doctors (as they are also staff)
    if (isStaff() || isDoctor()) {
      return <StaffDashboard />;
    }

    // Lab technician gets their specialized view
    if (hasRole('LabTechnician')) {
      return <LabTechnicianDashboard />;
    }

    // Customers get the customer dashboard
    if (isCustomer()) {
      return <CustomerDashboard />;
    }

    // Fallback to the customer dashboard for unknown roles
    return <CustomerDashboard />;
  };

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-[250px]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[250px] rounded-lg" />
            <Skeleton className="h-[250px] rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {renderDashboardByRole()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
