
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from 'lucide-react';
import { TestPanel } from '@/types/supabase';
import { useLabTestCart } from '@/contexts/LabTestCartContext';

const fetchHealthPackages = async (searchTerm: string): Promise<TestPanel[]> => {
  let query = supabase
    .from('testpanels')
    .select('*')
    .eq('isactive', true)
    .not('price', 'is', null);

  if (searchTerm) {
    query = query.or(`panelname.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  query = query.order('panelname', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }
  return data as TestPanel[];
};

const HealthPackageCard: React.FC<{ panel: TestPanel }> = ({ panel }) => {
  const { addToCart } = useLabTestCart();

  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>{panel.panelname}</CardTitle>
        <CardDescription>{panel.description || 'No description available.'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center text-sm text-gray-600">
          <Package className="mr-2 h-4 w-4 text-healthhub-blue" />
          <span>This is a package of multiple tests.</span>
        </div>
        <div className="text-2xl font-bold text-gray-800 mt-4">
          {panel.price ? `₹${panel.price.toFixed(2)}` : 'Price not available'}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-healthhub-orange text-white hover:bg-healthhub-orange/90"
          onClick={() => addToCart({ ...panel, type: 'panel' })}
          disabled={!panel.price}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

const HealthPackagesList: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const { data: panels, isLoading, isError, error } = useQuery({
    queryKey: ['healthPackages', searchTerm],
    queryFn: () => fetchHealthPackages(searchTerm),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mt-2 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
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
    return <div className="text-center text-red-500">Error fetching health packages: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;
  }

  if (panels?.length === 0) {
    return (
      <div className="text-center col-span-1 md:col-span-2 lg:col-span-3 py-16">
        <h3 className="text-xl font-semibold text-gray-700">No Results Found</h3>
        <p className="text-gray-500 mt-2">
          We couldn't find any health packages matching your search for "{searchTerm}".
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {panels?.map((panel) => (
        <HealthPackageCard key={panel.panelid} panel={panel} />
      ))}
    </div>
  );
};

export default HealthPackagesList;
