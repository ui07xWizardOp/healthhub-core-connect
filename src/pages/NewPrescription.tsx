
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import NewPrescriptionForm from '@/components/doctor/NewPrescriptionForm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewPrescriptionPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/doctor-portal">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portal
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">New Prescription</h1>
          <p className="text-gray-600 mb-6">Create and issue a new prescription for a patient.</p>
          <NewPrescriptionForm />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewPrescriptionPage;
