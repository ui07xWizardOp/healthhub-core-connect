
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import PatientSelector from './PatientSelector';
import { PatientReferral, Doctor } from '@/types/patientManagement';
import ReferralsLoadingSkeleton from './referrals/ReferralsLoadingSkeleton';
import ReferralsEmptyState from './referrals/ReferralsEmptyState';
import ReferralsTable from './referrals/ReferralsTable';
import CreateReferralDialog from './referrals/CreateReferralDialog';
import ReferralDetailsDialog from './referrals/ReferralDetailsDialog';

const PatientReferrals: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingReferral, setViewingReferral] = useState<PatientReferral | null>(null);

  const { data: referrals, isLoading, refetch } = useQuery({
    queryKey: ['patient-referrals', selectedPatientId],
    queryFn: async (): Promise<PatientReferral[]> => {
      if (!selectedPatientId) return [];
      const { data, error } = await supabase
        .from('patient_referrals')
        .select('*')
        .eq('patient_id', selectedPatientId)
        .order('referral_date', { ascending: false });
      if (error) throw error;
      return (data as PatientReferral[]) || [];
    },
    enabled: !!selectedPatientId
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['doctors-list-for-referrals', userProfile?.doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`doctorid, firstname, lastname, specialization`)
        .eq('isactive', true)
        .neq('doctorid', userProfile?.doctorId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.doctorId
  });

  const filteredReferrals = referrals?.filter(
    (referral: PatientReferral) => {
      return (referral.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             referral.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             referral.referred_to_external?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Patient Referrals</CardTitle>
            <CardDescription>Create and manage patient referrals</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedPatientId}>
            <Plus className="mr-2 h-4 w-4" /> Add Referral
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <PatientSelector onPatientSelect={setSelectedPatientId} />
            
            {selectedPatientId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search referrals..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {isLoading && <ReferralsLoadingSkeleton />}
          
          {!isLoading && filteredReferrals && filteredReferrals.length > 0 && (
            <ReferralsTable 
              referrals={filteredReferrals} 
              doctors={doctors}
              onViewReferral={setViewingReferral} 
            />
          )}

          {!isLoading && (!filteredReferrals || filteredReferrals.length === 0) && (
            <ReferralsEmptyState 
              hasSelectedPatient={!!selectedPatientId} 
              onAddReferral={() => setShowCreateDialog(true)} 
            />
          )}

        </CardContent>
      </Card>

      <CreateReferralDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        selectedPatientId={selectedPatientId}
        onReferralCreated={refetch}
      />
      
      {viewingReferral && (
        <ReferralDetailsDialog
          referral={viewingReferral}
          doctors={doctors}
          onClose={() => setViewingReferral(null)}
        />
      )}
    </div>
  );
};

export default PatientReferrals;
