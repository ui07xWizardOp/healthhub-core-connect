
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Clock } from 'lucide-react';

interface LabTest {
  testid: number;
  testname: string;
  description: string;
  price: number;
  sampletype: string;
  turnaroundtime: number; // in hours
}

const fetchLabTests = async () => {
  const { data, error } = await supabase
    .from('labtests')
    .select('*')
    .eq('isactive', true)
    .order('testname', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data as LabTest[];
};

const LabTestCard: React.FC<{ test: LabTest }> = ({ test }) => {
  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>{test.testname}</CardTitle>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center text-sm text-gray-600">
          <Droplet className="mr-2 h-4 w-4 text-healthhub-blue" />
          <span>Sample Type: {test.sampletype}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-2 h-4 w-4 text-healthhub-blue" />
          <span>Results in: {test.turnaroundtime} hours</span>
        </div>
        <div className="text-2xl font-bold text-gray-800 mt-4">
          ₹{test.price.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-healthhub-orange text-white hover:bg-healthhub-orange/90">
          Book Test
        </Button>
      </CardFooter>
    </Card>
  );
};

const LabTestsList: React.FC = () => {
  const { data: tests, isLoading, isError, error } = useQuery({
    queryKey: ['labTests'],
    queryFn: fetchLabTests,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mt-2 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
               <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
               <div className="h-8 bg-gray-200 rounded w-1/4 mt-4 animate-pulse"></div>
            </CardContent>
            <CardFooter>
               <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">Error fetching lab tests: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tests?.map((test) => (
        <LabTestCard key={test.testid} test={test} />
      ))}
    </div>
  );
};

export default LabTestsList;
