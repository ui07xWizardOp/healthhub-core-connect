
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Navigate } from 'react-router-dom';
import PatientMedicalHistory from '@/components/patient/PatientMedicalHistory';
import PatientTreatmentPlans from '@/components/patient/PatientTreatmentPlans';
import PatientProgressNotes from '@/components/patient/PatientProgressNotes';
import PatientReferrals from '@/components/patient/PatientReferrals';

const PatientManagement: React.FC = () => {
  const { isDoctor, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('medical-history');

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
            <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
            <p className="text-gray-600">
              Manage patient medical records, treatment plans, progress notes, and referrals
            </p>
          </div>
        </div>

        <Tabs defaultValue="medical-history" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <TabsTrigger value="medical-history">Medical History</TabsTrigger>
            <TabsTrigger value="treatment-plans">Treatment Plans</TabsTrigger>
            <TabsTrigger value="progress-notes">Progress Notes</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="medical-history" className="mt-0">
            <PatientMedicalHistory />
          </TabsContent>
          
          <TabsContent value="treatment-plans" className="mt-0">
            <PatientTreatmentPlans />
          </TabsContent>
          
          <TabsContent value="progress-notes" className="mt-0">
            <PatientProgressNotes />
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-0">
            <PatientReferrals />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientManagement;
