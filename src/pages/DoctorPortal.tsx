
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentManagement from '@/components/doctor/AppointmentManagement';
import PrescriptionManagement from '@/components/doctor/PrescriptionManagement';
import PatientHistory from '@/components/doctor/PatientHistory';
import ScheduleManagement from '@/components/doctor/ScheduleManagement';
import { Navigate } from 'react-router-dom';

const DoctorPortal: React.FC = () => {
  const { isDoctor, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('appointments');

  // Show loading state while auth status is being determined
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Redirect if user is not a doctor
  if (!isDoctor()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Doctor Portal</h1>
            <p className="text-gray-600">
              Manage appointments, prescriptions, and patient records
            </p>
          </div>
        </div>

        <Tabs defaultValue="appointments" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="patients">Patient History</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="mt-0">
            <AppointmentManagement />
          </TabsContent>
          
          <TabsContent value="prescriptions" className="mt-0">
            <PrescriptionManagement />
          </TabsContent>
          
          <TabsContent value="patients" className="mt-0">
            <PatientHistory />
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-0">
            <ScheduleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPortal;
