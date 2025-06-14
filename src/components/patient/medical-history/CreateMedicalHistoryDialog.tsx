
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NewMedicalRecord } from '@/types/patientManagement';

interface CreateMedicalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatientId: number | null;
  onRecordCreated: () => void;
}

const CreateMedicalHistoryDialog: React.FC<CreateMedicalHistoryDialogProps> = ({
  open,
  onOpenChange,
  selectedPatientId,
  onRecordCreated,
}) => {
  const { userProfile } = useAuth();
  const [newRecord, setNewRecord] = useState<Partial<NewMedicalRecord>>({
    record_type: 'medical_history',
    title: '',
    content: ''
  });

  const handleCreateRecord = async () => {
    if (!selectedPatientId || !userProfile?.doctorId) {
      toast.error('Please select a patient first');
      return;
    }

    if (!newRecord.title || !newRecord.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.from('patient_medical_records').insert({
        patient_id: selectedPatientId,
        doctor_id: userProfile.doctorId,
        record_type: 'medical_history',
        title: newRecord.title,
        content: newRecord.content,
        created_by: userProfile.userid
      });

      if (error) throw error;

      toast.success('Medical history record created successfully');
      onOpenChange(false);
      setNewRecord({
        record_type: 'medical_history',
        title: '',
        content: ''
      });
      onRecordCreated();
    } catch (error: any) {
      console.error('Error creating medical history record:', error);
      toast.error(error.message || 'Failed to create medical history record');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Medical History Record</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              placeholder="Title of medical history record"
              value={newRecord.title}
              onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Content</label>
            <Textarea
              id="content"
              placeholder="Detailed medical history information"
              className="min-h-[150px]"
              value={newRecord.content || ''}
              onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateRecord}>Create Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMedicalHistoryDialog;
