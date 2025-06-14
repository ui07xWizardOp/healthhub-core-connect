
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MedicalRecord } from '@/types/patientManagement';
import { format } from 'date-fns';

interface ProgressNoteDetailsDialogProps {
  record: MedicalRecord;
  onClose: () => void;
}

const ProgressNoteDetailsDialog: React.FC<ProgressNoteDetailsDialogProps> = ({ record, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record.title}</DialogTitle>
          <DialogDescription>
            Progress note from {format(new Date(record.record_date), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Details</h3>
            <div className="p-4 bg-gray-50 rounded-md border text-sm whitespace-pre-wrap">
              {record.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressNoteDetailsDialog;
