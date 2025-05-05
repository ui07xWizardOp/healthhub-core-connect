
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import LabTechnicianDashboard from '@/components/dashboard/LabTechnicianDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import DashboardSelector from '@/components/dashboard/DashboardSelector';

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
        <div className="p-6 flex items-center justify-center h-[calc(100vh-80px)]">
          <p className="text-lg text-gray-500">Loading user profile...</p>
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
