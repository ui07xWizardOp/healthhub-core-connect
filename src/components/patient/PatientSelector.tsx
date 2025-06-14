
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient } from '@/types/patient';

interface PatientSelectorProps {
  onPatientSelect: (patientId: number | null) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ onPatientSelect }) => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>('');

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

  const selectedPatient = patients?.find(p => p.customerid.toString() === selectedValue);

  return (
    <div className="space-y-2">
      <label htmlFor="patient-select" className="text-sm font-medium">
        Select Patient
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
            id="patient-select"
          >
            {selectedPatient
              ? `${selectedPatient.firstname} ${selectedPatient.lastname}`
              : isLoading ? "Loading patients..." : "Select a patient..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search patient by name..." />
            <CommandList>
                <CommandEmpty>No patient found.</CommandEmpty>
                <CommandGroup>
                {patients?.map((patient: Patient) => (
                    <CommandItem
                        key={patient.customerid}
                        value={`${patient.firstname} ${patient.lastname}`}
                        onSelect={() => {
                          const newSelectedValue = patient.customerid.toString();
                          if (selectedValue === newSelectedValue) {
                            setSelectedValue('');
                            onPatientSelect(null);
                          } else {
                            setSelectedValue(newSelectedValue);
                            onPatientSelect(patient.customerid);
                          }
                          setOpen(false);
                        }}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                selectedValue === patient.customerid.toString() ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {patient.firstname} {patient.lastname}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PatientSelector;
