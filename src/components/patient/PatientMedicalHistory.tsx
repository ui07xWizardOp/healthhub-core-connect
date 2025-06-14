
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import PatientSelector from './PatientSelector';
import { MedicalRecord } from '@/types/patientManagement';
import MedicalHistoryDetailsDialog from './medical-history/MedicalHistoryDetailsDialog';
import CreateMedicalHistoryDialog from './medical-history/CreateMedicalHistoryDialog';
import MedicalHistoryTable from './medical-history/MedicalHistoryTable';
import MedicalHistoryEmptyState from './medical-history/MedicalHistoryEmptyState';
import MedicalHistoryLoadingSkeleton from './medical-history/MedicalHistoryLoadingSkeleton';

const PatientMedicalHistory: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  
  const { data: medicalRecords, isLoading, refetch } = useQuery({
    queryKey: ['patient-medical-history', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      
      const { data, error } = await supabase
        .from('patient_medical_records')
        .select(`*`)
        .eq('patient_id', selectedPatientId)
        .eq('record_type', 'medical_history')
        .order('record_date', { ascending: false });
      
      if (error) throw error;
      return (data as MedicalRecord[]) || [];
    },
    enabled: !!selectedPatientId && !!userProfile?.doctorId
  });

  const filteredRecords = medicalRecords?.filter(
    (record: MedicalRecord) => {
      return record.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             record.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const handleRecordCreated = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Patient Medical History</CardTitle>
            <CardDescription>View and manage patient medical history records</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedPatientId}>
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <PatientSelector onPatientSelect={setSelectedPatientId} />
            
            {selectedPatientId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search medical history records"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {isLoading && selectedPatientId ? (
            <MedicalHistoryLoadingSkeleton />
          ) : selectedPatientId && filteredRecords && filteredRecords.length > 0 ? (
            <MedicalHistoryTable records={filteredRecords} onViewRecord={setViewingRecord} />
          ) : (
            <MedicalHistoryEmptyState 
              hasSelectedPatient={!!selectedPatientId} 
              onAddRecord={() => setShowCreateDialog(true)} 
            />
          )}
        </CardContent>
      </Card>

      {viewingRecord && (
        <MedicalHistoryDetailsDialog 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)} 
        />
      )}

      <CreateMedicalHistoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        selectedPatientId={selectedPatientId}
        onRecordCreated={handleRecordCreated}
      />
    </div>
  );
};

export default PatientMedicalHistory;
