
import React from 'react';
import { Button } from '@/components/ui/button';

interface PatientHistoryEmptyStateProps {
  searchQuery: string;
  clearSearch: () => void;
}

const PatientHistoryEmptyState: React.FC<PatientHistoryEmptyStateProps> = ({ searchQuery, clearSearch }) => {
  return (
    <div className="text-center py-10">
      <p className="text-gray-500">No patients found.</p>
      {searchQuery && (
        <Button
          variant="link"
          onClick={clearSearch}
          className="mt-2"
        >
          Clear search
        </Button>
      )}
    </div>
  );
};

export default PatientHistoryEmptyState;
