
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, Plus, FileText, Calendar, User, ExternalLink } from 'lucide-react';
import PatientSelector from './PatientSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PatientReferral } from '@/types/patientManagement';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const PatientReferrals: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newReferral, setNewReferral] = useState({
    specialty: '',
    reason: '',
    notes: '',
    referred_to_external: '',
    referred_to_doctor_id: null as number | null,
    is_external: true
  });
  
  // Fetch referrals for the selected patient
  const { data: referrals, isLoading, refetch } = useQuery({
    queryKey: ['patient-referrals', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      
      const { data, error } = await supabase
        .from('patient_referrals')
        .select(`
          referral_id,
          record_id,
          patient_id,
          referring_doctor_id,
          referred_to_doctor_id,
          referred_to_external,
          specialty,
          reason,
          status,
          referral_date,
          appointment_date,
          notes
        `)
        .eq('patient_id', selectedPatientId)
        .order('referral_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPatientId && !!userProfile?.doctorId
  });

  // Fetch available doctors for referral
  const { data: doctors } = useQuery({
    queryKey: ['doctors-for-referral'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          doctorid,
          firstname,
          lastname,
          specialization
        `)
        .eq('isactive', true)
        .neq('doctorid', userProfile?.doctorId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.doctorId && showCreateDialog
  });

  // Filter referrals based on search query
  const filteredReferrals = referrals?.filter(
    (referral: PatientReferral) => {
      return (referral.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             referral.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             referral.referred_to_external?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  );

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
      // First create a medical record
      const { data: recordData, error: recordError } = await supabase
        .from('patient_medical_records')
        .insert({
          patient_id: selectedPatientId,
          doctor_id: userProfile.doctorId,
          record_type: 'referral',
          title: `Referral to ${newReferral.is_external ? newReferral.referred_to_external : 'Dr. (Internal)'}`,
          content: newReferral.reason,
          created_by: userProfile.userid
        })
        .select('record_id')
        .single();

      if (recordError) throw recordError;

      // Then create the referral record
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
      setShowCreateDialog(false);
      setNewReferral({
        specialty: '',
        reason: '',
        notes: '',
        referred_to_external: '',
        referred_to_doctor_id: null,
        is_external: true
      });
      refetch();
    } catch (error: any) {
      console.error('Error creating referral:', error);
      toast.error(error.message || 'Failed to create referral');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Patient Referrals</CardTitle>
            <CardDescription>Create and manage patient referrals</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Referral
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <PatientSelector onPatientSelect={setSelectedPatientId} />
            
            {selectedPatientId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search referrals"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {isLoading && selectedPatientId ? (
            <div className="mt-4 animate-pulse">
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full rounded"></div>
            </div>
          ) : selectedPatientId && filteredReferrals && filteredReferrals.length > 0 ? (
            <div className="mt-4 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Referred To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral: PatientReferral) => (
                    <TableRow key={referral.referral_id}>
                      <TableCell className="font-medium">
                        {format(new Date(referral.referral_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{referral.specialty}</TableCell>
                      <TableCell>
                        {referral.referred_to_external ? 
                          <div className="flex items-center">
                            {referral.referred_to_external}
                            <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                          </div> : 
                          'Internal Doctor'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'completed' ? 'bg-green-100 text-green-800' :
                          referral.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          referral.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : selectedPatientId ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No referrals</h3>
              <p className="text-gray-500 mb-4">This patient doesn't have any referrals yet.</p>
              <Button onClick={() => setShowCreateDialog(true)}>Create Referral</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Select a patient</h3>
              <p className="text-gray-500">Please select a patient to view their referrals</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Referral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="specialty" className="text-sm font-medium">Specialty</label>
              <Input
                id="specialty"
                placeholder="Specialty (e.g., Cardiology, Orthopedics)"
                value={newReferral.specialty}
                onChange={(e) => setNewReferral({ ...newReferral, specialty: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Type</label>
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant={newReferral.is_external ? "default" : "outline"}
                  onClick={() => setNewReferral({ ...newReferral, is_external: true })}
                >
                  External
                </Button>
                <Button 
                  type="button" 
                  variant={!newReferral.is_external ? "default" : "outline"}
                  onClick={() => setNewReferral({ ...newReferral, is_external: false })}
                >
                  Internal
                </Button>
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
                    <SelectValue placeholder="Select a doctor" />
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
              <Textarea
                id="reason"
                placeholder="Reason for referral"
                value={newReferral.reason}
                onChange={(e) => setNewReferral({ ...newReferral, reason: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                id="notes"
                placeholder="Additional notes"
                value={newReferral.notes || ''}
                onChange={(e) => setNewReferral({ ...newReferral, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateReferral}>Create Referral</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientReferrals;
