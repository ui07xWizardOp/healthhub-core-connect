
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, User } from 'lucide-react';

interface MedicalHistoryEmptyStateProps {
  hasSelectedPatient: boolean;
  onAddRecord: () => void;
}

const MedicalHistoryEmptyState: React.FC<MedicalHistoryEmptyStateProps> = ({ hasSelectedPatient, onAddRecord }) => {
  if (hasSelectedPatient) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No medical history records</h3>
        <p className="text-gray-500 mb-4">This patient doesn't have any medical history records yet.</p>
        <Button onClick={onAddRecord}>Add Medical History</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <User className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Select a patient</h3>
      <p className="text-gray-500">Please select a patient to view their medical history</p>
    </div>
  );
};

export default MedicalHistoryEmptyState;
