
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatientId: number | null;
  onReferralCreated: () => void;
}

const CreateReferralDialog: React.FC<CreateReferralDialogProps> = ({ open, onOpenChange, selectedPatientId, onReferralCreated }) => {
  const { userProfile } = useAuth();
  const [newReferral, setNewReferral] = useState({
    specialty: '',
    reason: '',
    notes: '',
    referred_to_external: '',
    referred_to_doctor_id: null as number | null,
    is_external: true
  });
  
  const { data: doctors, isPending: isLoadingDoctors } = useQuery({
    queryKey: ['doctors-for-referral', userProfile?.doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`doctorid, firstname, lastname, specialization`)
        .eq('isactive', true)
        .neq('doctorid', userProfile?.doctorId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.doctorId && open && !newReferral.is_external,
  });

  const handleCreateReferral = async () => {
    if (!selectedPatientId || !userProfile?.doctorId) {
      toast.error('Please select a patient first');
      return;
    }

    if (!newReferral.specialty || (!newReferral.is_external && !newReferral.referred_to_doctor_id) || 
        (newReferral.is_external && !newReferral.referred_to_external) || !newReferral.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const doctorForTitle = newReferral.is_external 
        ? newReferral.referred_to_external 
        : doctors?.find(d => d.doctorid === newReferral.referred_to_doctor_id);

      const titleName = newReferral.is_external 
        ? doctorForTitle 
        : `Dr. ${doctorForTitle?.firstname} ${doctorForTitle?.lastname}`;
      
      const { data: recordData, error: recordError } = await supabase
        .from('patient_medical_records')
        .insert({
          patient_id: selectedPatientId,
          doctor_id: userProfile.doctorId,
          record_type: 'referral',
          title: `Referral to ${titleName}`,
          content: newReferral.reason,
          created_by: userProfile.userid
        })
        .select('record_id')
        .single();

      if (recordError) throw recordError;

      const { error: referralError } = await supabase
        .from('patient_referrals')
        .insert({
          record_id: recordData.record_id,
          patient_id: selectedPatientId,
          referring_doctor_id: userProfile.doctorId,
          referred_to_doctor_id: newReferral.is_external ? null : newReferral.referred_to_doctor_id,
          referred_to_external: newReferral.is_external ? newReferral.referred_to_external : null,
          specialty: newReferral.specialty,
          reason: newReferral.reason,
          notes: newReferral.notes
        });

      if (referralError) throw referralError;

      toast.success('Referral created successfully');
      onOpenChange(false);
      setNewReferral({
        specialty: '',
        reason: '',
        notes: '',
        referred_to_external: '',
        referred_to_doctor_id: null,
        is_external: true
      });
      onReferralCreated();
    } catch (error: any) {
      console.error('Error creating referral:', error);
      toast.error(error.message || 'Failed to create referral');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Referral</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="specialty" className="text-sm font-medium">Specialty</label>
            <Input
              id="specialty"
              placeholder="E.g., Cardiology, Orthopedics"
              value={newReferral.specialty}
              onChange={(e) => setNewReferral({ ...newReferral, specialty: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Type</label>
            <div className="flex gap-4">
              <Button type="button" variant={newReferral.is_external ? "default" : "outline"} onClick={() => setNewReferral({ ...newReferral, is_external: true, referred_to_doctor_id: null })}>External</Button>
              <Button type="button" variant={!newReferral.is_external ? "default" : "outline"} onClick={() => setNewReferral({ ...newReferral, is_external: false, referred_to_external: '' })}>Internal</Button>
            </div>
          </div>

          {newReferral.is_external ? (
            <div className="space-y-2">
              <label htmlFor="external" className="text-sm font-medium">External Provider</label>
              <Input
                id="external"
                placeholder="Name of external provider"
                value={newReferral.referred_to_external}
                onChange={(e) => setNewReferral({ ...newReferral, referred_to_external: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="internal" className="text-sm font-medium">Internal Doctor</label>
              <Select
                value={newReferral.referred_to_doctor_id?.toString() || ''}
                onValueChange={(value) => setNewReferral({ ...newReferral, referred_to_doctor_id: parseInt(value, 10) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Doctors</SelectLabel>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.doctorid} value={doctor.doctorid.toString()}>
                        Dr. {doctor.firstname} {doctor.lastname} ({doctor.specialization || 'General'})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">Reason</label>
            <Textarea id="reason" placeholder="Reason for referral" value={newReferral.reason} onChange={(e) => setNewReferral({ ...newReferral, reason: e.target.value })}/>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
            <Textarea id="notes" placeholder="Additional notes" value={newReferral.notes || ''} onChange={(e) => setNewReferral({ ...newReferral, notes: e.target.value })}/>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateReferral}>Create Referral</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReferralDialog;
