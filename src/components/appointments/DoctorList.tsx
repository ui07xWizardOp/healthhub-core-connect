
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Doctor } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stethoscope } from 'lucide-react';

const fetchDoctors = async (): Promise<Doctor[]> => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('isactive', true);

  if (error) throw new Error(error.message);
  return data as Doctor[];
};

interface DoctorListProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<{doctor: Doctor, onSelectDoctor: (doctor: Doctor) => void}> = ({ doctor, onSelectDoctor }) => (
    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-healthhub-blue/10 rounded-full">
                <Stethoscope className="h-8 w-8 text-healthhub-blue" />
            </div>
            <div>
                <CardTitle>{doctor.firstname} {doctor.lastname}</CardTitle>
                <CardDescription>{doctor.specialization}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-gray-600 line-clamp-3">{doctor.biography || 'No biography available.'}</p>
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={() => onSelectDoctor(doctor)}>
              View Availability & Book
            </Button>
        </CardFooter>
    </Card>
);

const DoctorListSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
    </div>
);

const DoctorList: React.FC<DoctorListProps> = ({ onSelectDoctor }) => {
  const { data: doctors, isLoading, isError, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: fetchDoctors
  });

  if (isLoading) return <DoctorListSkeleton />;
  if (isError) return <div className="text-center text-red-500">Error fetching doctors: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;
  if (!doctors || doctors.length === 0) {
    return <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-700">No Doctors Available</h3>
        <p className="text-gray-500 mt-2">
            There are currently no doctors available for booking. Please check back later.
        </p>
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.doctorid} doctor={doctor} onSelectDoctor={onSelectDoctor} />
      ))}
    </div>
  );
};

export default DoctorList;

