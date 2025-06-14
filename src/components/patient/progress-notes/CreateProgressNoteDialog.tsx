
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { NewMedicalRecord } from '@/types/patientManagement';

interface CreateProgressNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatientId: number | null;
  onNoteCreated: () => void;
}

const CreateProgressNoteDialog: React.FC<CreateProgressNoteDialogProps> = ({ open, onOpenChange, selectedPatientId, onNoteCreated }) => {
  const { userProfile } = useAuth();
  const [newRecord, setNewRecord] = useState<Partial<NewMedicalRecord>>({
    record_type: 'progress_note',
    title: '',
    content: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRecord = async () => {
    if (!selectedPatientId || !userProfile?.doctorId) {
      toast.error('Please select a patient first');
      return;
    }

    if (!newRecord.title || !newRecord.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from('patient_medical_records').insert({
        patient_id: selectedPatientId,
        doctor_id: userProfile.doctorId,
        record_type: 'progress_note',
        title: newRecord.title,
        content: newRecord.content,
        created_by: userProfile.userid
      });

      if (error) throw error;

      toast.success('Progress note created successfully');
      setNewRecord({
        record_type: 'progress_note',
        title: '',
        content: ''
      });
      onNoteCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating progress note:', error);
      toast.error(error.message || 'Failed to create progress note');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Progress Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              placeholder="Title of progress note"
              value={newRecord.title || ''}
              onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Content</label>
            <Textarea
              id="content"
              placeholder="Detailed progress note information"
              className="min-h-[150px]"
              value={newRecord.content || ''}
              onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateRecord} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProgressNoteDialog;
