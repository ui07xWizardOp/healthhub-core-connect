
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MedicalRecord } from '@/types/patientManagement';
import { format } from 'date-fns';

interface MedicalHistoryDetailsDialogProps {
  record: MedicalRecord;
  onClose: () => void;
}

const MedicalHistoryDetailsDialog: React.FC<MedicalHistoryDetailsDialogProps> = ({ record, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{record.title}</DialogTitle>
          <p className="text-sm text-gray-500">
            Recorded on {format(new Date(record.record_date), 'MMMM d, yyyy')}
          </p>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {record.content}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalHistoryDetailsDialog;
