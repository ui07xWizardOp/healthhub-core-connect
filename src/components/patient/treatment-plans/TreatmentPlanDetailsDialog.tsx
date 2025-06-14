
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
import { ClipboardList } from 'lucide-react';

interface TreatmentPlanDetailsDialogProps {
  record: MedicalRecord;
  onClose: () => void;
}

const TreatmentPlanDetailsDialog: React.FC<TreatmentPlanDetailsDialogProps> = ({ record, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            <DialogTitle>{record.title}</DialogTitle>
          </div>
          <DialogDescription>
            Treatment plan from {format(new Date(record.record_date), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Plan Details</h3>
            <div className="p-4 bg-gray-50 rounded-md border text-sm whitespace-pre-wrap">
              {record.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TreatmentPlanDetailsDialog;
