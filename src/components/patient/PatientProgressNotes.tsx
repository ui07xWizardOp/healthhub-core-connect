
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
import ProgressNoteDetailsDialog from './ProgressNoteDetailsDialog';
import CreateProgressNoteDialog from './progress-notes/CreateProgressNoteDialog';
import ProgressNotesTable from './progress-notes/ProgressNotesTable';
import ProgressNotesEmptyState from './progress-notes/ProgressNotesEmptyState';
import ProgressNotesLoadingSkeleton from './progress-notes/ProgressNotesLoadingSkeleton';


const PatientProgressNotes: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  
  const { data: progressNotes, isLoading, refetch } = useQuery({
    queryKey: ['patient-progress-notes', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      
      const { data, error } = await supabase
        .from('patient_medical_records')
        .select(`*`)
        .eq('patient_id', selectedPatientId)
        .eq('record_type', 'progress_note')
        .order('record_date', { ascending: false });
      
      if (error) throw error;
      return (data as MedicalRecord[]) || [];
    },
    enabled: !!selectedPatientId && !!userProfile?.doctorId
  });

  const filteredRecords = progressNotes?.filter(
    (record: MedicalRecord) => {
      return record.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             record.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const handleNoteCreated = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Patient Progress Notes</CardTitle>
            <CardDescription>Create and manage patient progress notes</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedPatientId}>
            <Plus className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <PatientSelector onPatientSelect={setSelectedPatientId} />
            
            {selectedPatientId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search progress notes"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {isLoading && selectedPatientId ? (
            <ProgressNotesLoadingSkeleton />
          ) : selectedPatientId && filteredRecords && filteredRecords.length > 0 ? (
            <ProgressNotesTable records={filteredRecords} onViewRecord={setViewingRecord} />
          ) : (
            <ProgressNotesEmptyState 
              hasSelectedPatient={!!selectedPatientId} 
              onAddNote={() => setShowCreateDialog(true)} 
            />
          )}
        </CardContent>
      </Card>

      {viewingRecord && (
        <ProgressNoteDetailsDialog 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)} 
        />
      )}

      <CreateProgressNoteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        selectedPatientId={selectedPatientId}
        onNoteCreated={handleNoteCreated}
      />
    </div>
  );
};

export default PatientProgressNotes;
