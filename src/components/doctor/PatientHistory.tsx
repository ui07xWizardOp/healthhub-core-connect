
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import PatientDetailsDialog from './PatientDetailsDialog';
import { Patient } from '@/types/patient';
import PatientSearchBar from './patient-history/PatientSearchBar';
import PatientHistorySkeleton from './patient-history/PatientHistorySkeleton';
import PatientTable from './patient-history/PatientTable';
import PatientHistoryEmptyState from './patient-history/PatientHistoryEmptyState';

const PatientHistory: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-patients', userProfile?.doctorId],
    queryFn: async () => {
      if (!userProfile?.doctorId) return [];
      
      const { data, error } = await supabase.rpc('get_doctor_patients' as any, {
        p_doctor_id: userProfile.doctorId,
      });

      if (error) {
        console.error('Error fetching doctor patients:', error);
        throw error;
      }
      
      return (data as unknown as Patient[]) || [];
    },
    enabled: !!userProfile?.doctorId,
  });

  const filteredPatients = patients?.filter(
    (patient: Patient) => {
      const fullName = `${patient.firstname} ${patient.lastname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || 
             patient.customerid.toString().includes(searchQuery);
    }
  );

  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient History</CardTitle>
          <CardDescription>View medical history for your patients</CardDescription>
        </CardHeader>
        
        <CardContent>
          <PatientSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {isLoading ? (
            <PatientHistorySkeleton />
          ) : filteredPatients && filteredPatients.length > 0 ? (
            <PatientTable patients={filteredPatients} onViewDetails={viewPatientDetails} />
          ) : (
            <PatientHistoryEmptyState searchQuery={searchQuery} clearSearch={() => setSearchQuery('')} />
          )}
        </CardContent>
      </Card>
      
      {selectedPatient && (
        <PatientDetailsDialog
          patient={selectedPatient}
          open={!!selectedPatient}
          onOpenChange={(open) => !open && setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default PatientHistory;
