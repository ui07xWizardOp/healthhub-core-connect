
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
  const { userProfile, isAdmin, isStaff, isDoctor, isCustomer, hasRole, loading } = useAuth();

  console.log('Dashboard - userProfile:', userProfile);
  console.log('Dashboard - isAdmin():', isAdmin());
  console.log('Dashboard - roles:', userProfile?.roles);

  const renderDashboardByRole = () => {
    // Admin gets their special dashboard selector
    if (isAdmin()) {
      console.log('Rendering DashboardSelector for Admin');
      return <DashboardSelector />;
    }

    // Staff dashboard for staff users and doctors (as they are also staff)
    if (isStaff() || isDoctor()) {
      console.log('Rendering StaffDashboard for Staff/Doctor');
      return <StaffDashboard />;
    }

    // Lab technician gets their specialized view
    if (hasRole('LabTechnician')) {
      console.log('Rendering LabTechnicianDashboard');
      return <LabTechnicianDashboard />;
    }

    // Customers get the customer dashboard
    if (isCustomer()) {
      console.log('Rendering CustomerDashboard');
      return <CustomerDashboard />;
    }

    // Fallback to the customer dashboard for unknown roles
    console.log('Rendering fallback CustomerDashboard');
    return <CustomerDashboard />;
  };

  if (loading) {
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

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading your profile...</h2>
          <p className="text-gray-500 mt-2">Please wait while we set up your dashboard.</p>
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
