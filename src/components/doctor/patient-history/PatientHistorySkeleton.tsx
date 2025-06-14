
import React from 'react';

const PatientHistorySkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
      <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
      <div className="h-10 bg-gray-100 w-full rounded"></div>
    </div>
  );
};

export default PatientHistorySkeleton;
