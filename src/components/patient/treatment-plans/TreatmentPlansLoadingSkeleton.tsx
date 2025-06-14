
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TreatmentPlansLoadingSkeleton: React.FC = () => {
  return (
    <div className="mt-4 space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
};

export default TreatmentPlansLoadingSkeleton;
