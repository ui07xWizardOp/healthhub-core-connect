
import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList, User } from 'lucide-react';

interface TreatmentPlansEmptyStateProps {
  hasSelectedPatient: boolean;
  onAddPlan: () => void;
}

const TreatmentPlansEmptyState: React.FC<TreatmentPlansEmptyStateProps> = ({ hasSelectedPatient, onAddPlan }) => {
  if (hasSelectedPatient) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No treatment plans found</h3>
        <p className="text-gray-500 mb-4">This patient doesn't have any treatment plans yet.</p>
        <Button onClick={onAddPlan}>Add Treatment Plan</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <User className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Select a patient</h3>
      <p className="text-gray-500">Please select a patient to view their treatment plans</p>
    </div>
  );
};

export default TreatmentPlansEmptyState;
