import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PatientReferral, Doctor } from '@/types/patientManagement';
import { format } from 'date-fns';
import { ExternalLink, User, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralDetailsDialogProps {
  referral: PatientReferral;
  doctors: Doctor[];
  onClose: () => void;
  onReferralUpdated: () => void;
}

const ReferralDetailsDialog: React.FC<ReferralDetailsDialogProps> = ({ referral, doctors, onClose, onReferralUpdated }) => {
  const { userProfile } = useAuth();
  const [status, setStatus] = useState<PatientReferral['status']>(referral.status);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    referral.appointment_date ? new Date(referral.appointment_date) : undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const getDoctorName = (id: number | null) => {
    if (!id) return 'N/A';
    if (id === userProfile?.doctorId) return `${userProfile.firstname} ${userProfile.lastname}`;
    const doctor = doctors.find(d => d.doctorid === id);
    return doctor ? `${doctor.firstname} ${doctor.lastname}` : 'N/A';
  };
  
  const referringDoctorName = getDoctorName(referral.referring_doctor_id);
  const referredToDoctorName = getDoctorName(referral.referred_to_doctor_id);

  const isReferredToDoctor = userProfile?.doctorId === referral.referred_to_doctor_id;
  const isReferringDoctor = userProfile?.doctorId === referral.referring_doctor_id;

  const handleUpdateReferral = async () => {
    if (!isReferredToDoctor) return;

    if (status === 'scheduled' && !appointmentDate) {
      toast.error('Please select an appointment date for scheduled referrals.');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('patient_referrals')
        .update({
          status: status,
          appointment_date: status === 'scheduled' && appointmentDate ? appointmentDate.toISOString() : null,
        })
        .eq('referral_id', referral.referral_id);

      if (error) throw error;

      toast.success('Referral updated successfully');
      onReferralUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating referral:', error);
      toast.error(error.message || 'Failed to update referral');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelReferral = async () => {
    if (!isReferringDoctor || referral.status !== 'pending') return;

    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('patient_referrals')
        .update({ status: 'cancelled' })
        .eq('referral_id', referral.referral_id);

      if (error) throw error;

      toast.success('Referral cancelled successfully');
      onReferralUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error cancelling referral:', error);
      toast.error(error.message || 'Failed to cancel referral');
    } finally {
      setIsCancelling(false);
    }
  };

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

        {isReferredToDoctor && (
          <div className="pt-4 mt-4 border-t">
            <h4 className="font-semibold text-gray-800 mb-4">Update Referral</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as PatientReferral['status'])}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {status === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Appointment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !appointmentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {appointmentDate ? format(appointmentDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={appointmentDate}
                        onSelect={setAppointmentDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="pt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {isReferredToDoctor && (
            <Button onClick={handleUpdateReferral} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          )}
          {isReferringDoctor && referral.status === 'pending' && (
            <Button variant="destructive" onClick={handleCancelReferral} disabled={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Cancel Referral'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralDetailsDialog;
