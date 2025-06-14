
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
import { Patient } from '@/types/patient';

interface PatientSelectorProps {
  onPatientSelect: (patientId: number | null) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ onPatientSelect }) => {
  const { userProfile } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Fetch all patients for this doctor using the optimized RPC function
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-patients', userProfile?.doctorId],
    queryFn: async () => {
      if (!userProfile?.doctorId) return [];
      
      const { data, error } = await supabase.rpc('get_doctor_patients' as any, {
        p_doctor_id: userProfile.doctorId,
      });

      if (error) {
        console.error('Error fetching doctor patients:', error);
        throw error;
      }
      
      return (data as unknown as Patient[]) || [];
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
          <SelectValue placeholder={isLoading ? "Loading patients..." : "Select a patient"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Patients</SelectLabel>
            {patients?.map((patient: Patient) => (
              <SelectItem key={patient.customerid} value={patient.customerid.toString()}>
                {patient.firstname} {patient.lastname}
              </SelectItem>
            ))}
            {!isLoading && patients?.length === 0 && (
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
