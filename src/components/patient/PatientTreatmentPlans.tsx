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
import TreatmentPlanDetailsDialog from './treatment-plans/TreatmentPlanDetailsDialog';
import CreateTreatmentPlanDialog from './treatment-plans/CreateTreatmentPlanDialog';
import TreatmentPlansTable from './treatment-plans/TreatmentPlansTable';
import TreatmentPlansEmptyState from './treatment-plans/TreatmentPlansEmptyState';
import TreatmentPlansLoadingSkeleton from './treatment-plans/TreatmentPlansLoadingSkeleton';

const PatientTreatmentPlans: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  
  const { data: treatmentPlans, isLoading, refetch } = useQuery({
    queryKey: ['patient-treatment-plans', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      
      const { data, error } = await supabase
        .from('patient_medical_records')
        .select(`*`)
        .eq('patient_id', selectedPatientId)
        .eq('record_type', 'treatment_plan')
        .order('record_date', { ascending: false });
      
      if (error) throw error;
      return (data as MedicalRecord[]) || [];
    },
    enabled: !!selectedPatientId && !!userProfile?.doctorId
  });

  const filteredRecords = treatmentPlans?.filter(
    (record: MedicalRecord) => {
      return record.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             record.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const handlePlanCreated = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Patient Treatment Plans</CardTitle>
            <CardDescription>Create and manage patient treatment plans</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedPatientId}>
            <Plus className="mr-2 h-4 w-4" /> Add Plan
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <PatientSelector onPatientSelect={setSelectedPatientId} />
            
            {selectedPatientId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search treatment plans"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {isLoading && selectedPatientId ? (
            <TreatmentPlansLoadingSkeleton />
          ) : selectedPatientId && filteredRecords && filteredRecords.length > 0 ? (
            <TreatmentPlansTable records={filteredRecords} onViewRecord={setViewingRecord} />
          ) : (
            <TreatmentPlansEmptyState 
              hasSelectedPatient={!!selectedPatientId} 
              onAddPlan={() => setShowCreateDialog(true)} 
            />
          )}
        </CardContent>
      </Card>

      {viewingRecord && (
        <TreatmentPlanDetailsDialog
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}

      <CreateTreatmentPlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        selectedPatientId={selectedPatientId}
        onPlanCreated={handlePlanCreated}
      />
    </div>
  );
};

export default PatientTreatmentPlans;
