
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LabOrder, LabOrderItem } from '@/types/supabase';
import LabOrderResultCard from './LabOrderResultCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox } from 'lucide-react';

// Define a more detailed type for our query
export type LabOrderWithResults = LabOrder & {
  laborderitems: (LabOrderItem & {
    labtests: {
      testname: string;
      units: string | null;
      malenormalrange: string | null;
      femalenormalrange: string | null;
      childnormalrange: string | null;
    } | null;
    testpanels: {
      panelname: string;
    } | null;
    testresults: ({
      resultid: number;
      result: string | null;
      isabnormal: boolean | null;
      labtests: {
        testname: string;
        units: string | null;
        malenormalrange: string | null;
        femalenormalrange: string | null;
        childnormalrange: string | null;
      } | null;
    })[];
  })[];
};

const fetchTestResults = async (customerId: number): Promise<LabOrderWithResults[]> => {
  const { data, error } = await supabase
    .from('laborders')
    .select(`
      *,
      laborderitems (
        *,
        labtests (testname, units, malenormalrange, femalenormalrange, childnormalrange),
        testpanels (panelname),
        testresults (
          *,
          labtests (testname, units, malenormalrange, femalenormalrange, childnormalrange)
        )
      )
    `)
    .eq('customerid', customerId)
    .order('orderdate', { ascending: false });

  if (error) throw new Error(error.message);
  return data as LabOrderWithResults[];
};

const TestResultViewer: React.FC = () => {
  const { userProfile } = useAuth();
  const { data: labOrders, isLoading, isError, error } = useQuery({
    queryKey: ['testResults', userProfile?.userid],
    queryFn: () => fetchTestResults(userProfile!.userid),
    enabled: !!userProfile?.userid,
  });

  if (isLoading) {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">Error: {error.message}</div>;
  }

  if (!labOrders || labOrders.length === 0) {
    return (
        <div className="text-center py-16 bg-white rounded-lg border">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold text-gray-800">No Test Results Found</h3>
            <p className="mt-1 text-gray-500">You do not have any lab test results available yet.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {labOrders.map(order => (
        <LabOrderResultCard key={order.orderid} order={order} gender={userProfile?.gender} />
      ))}
    </div>
  );
};

export default TestResultViewer;
