
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Patient {
  customerid: number;
  firstname: string;
  lastname: string;
  gender?: string;
  dateofbirth?: string;
}

interface PatientSelectorProps {
  onPatientSelect: (patientId: number | null) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ onPatientSelect }) => {
  const { userProfile } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Fetch all patients for this doctor
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-patients', userProfile?.doctorId],
    queryFn: async () => {
      // First get appointments with this doctor to find all patients
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          customerid
        `)
        .eq('doctorid', userProfile?.doctorId)
        .order('appointmentdate', { ascending: false });
      
      if (appointmentError) throw appointmentError;
      
      // Get unique customer IDs
      const uniqueCustomerIds = [...new Set(appointmentData?.map(a => a.customerid))];
      
      if (uniqueCustomerIds.length === 0) return [];
      
      // Get customer details
      const { data: customerData, error: customerError } = await supabase
        .from('users')
        .select(`
          userid,
          firstname,
          lastname,
          customerprofiles:customerprofiles(
            dateofbirth,
            gender
          )
        `)
        .in('userid', uniqueCustomerIds);
      
      if (customerError) throw customerError;
      
      // Map data to get patient information
      return customerData?.map(customer => {
        return {
          customerid: customer.userid,
          firstname: customer.firstname,
          lastname: customer.lastname,
          gender: customer.customerprofiles?.[0]?.gender,
          dateofbirth: customer.customerprofiles?.[0]?.dateofbirth,
        };
      }) || [];
    },
    enabled: !!userProfile?.doctorId
  });

  const handlePatientChange = (value: string) => {
    setSelectedPatientId(value);
    onPatientSelect(value ? parseInt(value, 10) : null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="patient-select" className="text-sm font-medium">
        Select Patient
      </label>
      <Select
        value={selectedPatientId}
        onValueChange={handlePatientChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full" id="patient-select">
          <SelectValue placeholder="Select a patient" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Patients</SelectLabel>
            {patients?.map((patient: Patient) => (
              <SelectItem key={patient.customerid} value={patient.customerid.toString()}>
                {patient.firstname} {patient.lastname}
              </SelectItem>
            ))}
            {patients?.length === 0 && (
              <SelectItem value="no-patients" disabled>
                No patients found
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PatientSelector;
