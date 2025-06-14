
import React from 'react';

const TreatmentPlansLoadingSkeleton: React.FC = () => {
  return (
    <div className="mt-4 animate-pulse">
      <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
      <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
      <div className="h-10 bg-gray-100 w-full rounded"></div>
    </div>
  );
};

export default TreatmentPlansLoadingSkeleton;
