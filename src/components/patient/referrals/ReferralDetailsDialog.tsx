
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PatientReferral, Doctor } from '@/types/patientManagement';
import { format } from 'date-fns';
import { ExternalLink, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralDetailsDialogProps {
  referral: PatientReferral;
  doctors: Doctor[];
  onClose: () => void;
}

const ReferralDetailsDialog: React.FC<ReferralDetailsDialogProps> = ({ referral, doctors, onClose }) => {
  const { userProfile } = useAuth();
  
  const getDoctorName = (id: number | null) => {
    if (!id) return 'N/A';
    if (id === userProfile?.doctorId) return `${userProfile.firstname} ${userProfile.lastname}`;
    const doctor = doctors.find(d => d.doctorid === id);
    return doctor ? `${doctor.firstname} ${doctor.lastname}` : 'N/A';
  };
  
  const referringDoctorName = getDoctorName(referral.referring_doctor_id);
  const referredToDoctorName = getDoctorName(referral.referred_to_doctor_id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Referral to {referral.specialty}</DialogTitle>
          <DialogDescription>
            Referral from {format(new Date(referral.referral_date), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Referred To</h4>
              {referral.referred_to_external ? (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <span>{referral.referred_to_external} (External)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Dr. {referredToDoctorName} (Internal)</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Referring Doctor</h4>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Dr. {referringDoctorName}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Status</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                referral.status === 'completed' ? 'bg-green-100 text-green-800' :
                referral.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                referral.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
              </span>
            </div>
            {referral.appointment_date && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Appointment Date</h4>
                <span>{format(new Date(referral.appointment_date), 'PPP p')}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Reason for Referral</h4>
            <div className="p-4 bg-gray-50 rounded-md border text-sm whitespace-pre-wrap">
              {referral.reason}
            </div>
          </div>

          {referral.notes && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Notes</h4>
              <div className="p-4 bg-gray-50 rounded-md border text-sm whitespace-pre-wrap">
                {referral.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralDetailsDialog;
