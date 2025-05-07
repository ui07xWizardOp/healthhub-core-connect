
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, User, FileText, CalendarDays, ClipboardList, Pill, TestTube } from 'lucide-react';
import PatientDetailsDialog from './PatientDetailsDialog';

interface Patient {
  customerid: number;
  firstname: string;
  lastname: string;
  gender?: string;
  dateofbirth?: string;
  bloodgroup?: string;
  lastvisit?: string;
}

const PatientHistory: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Fetch doctor's patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-patients', userProfile?.doctorId],
    queryFn: async () => {
      // First get appointments with this doctor to find all patients
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          customerid,
          appointmentdate
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
            gender,
            bloodgroup
          )
        `)
        .in('userid', uniqueCustomerIds);
      
      if (customerError) throw customerError;
      
      // Map data to get patient information with last visit date
      return customerData?.map(customer => {
        // Find the most recent appointment for this patient
        const patientAppointments = appointmentData
          .filter(a => a.customerid === customer.userid)
          .sort((a, b) => new Date(b.appointmentdate).getTime() - new Date(a.appointmentdate).getTime());
        
        const lastVisit = patientAppointments.length > 0 ? patientAppointments[0].appointmentdate : null;
        
        return {
          customerid: customer.userid,
          firstname: customer.firstname,
          lastname: customer.lastname,
          gender: customer.customerprofiles?.[0]?.gender,
          dateofbirth: customer.customerprofiles?.[0]?.dateofbirth,
          bloodgroup: customer.customerprofiles?.[0]?.bloodgroup,
          lastvisit: lastVisit
        };
      }) || [];
    },
    enabled: !!userProfile?.doctorId
  });

  // Filter patients based on search query
  const filteredPatients = patients?.filter(
    (patient: Patient) => {
      const fullName = `${patient.firstname} ${patient.lastname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || 
             patient.customerid.toString().includes(searchQuery);
    }
  );

  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient History</CardTitle>
          <CardDescription>View medical history for your patients</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search by patient name"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full rounded"></div>
            </div>
          ) : filteredPatients && filteredPatients.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead className="hidden md:table-cell">Gender</TableHead>
                    <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
                    <TableHead className="hidden md:table-cell">Blood Group</TableHead>
                    <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient: Patient) => (
                    <TableRow key={patient.customerid}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {patient.firstname} {patient.lastname}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {patient.gender || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {patient.dateofbirth 
                          ? format(new Date(patient.dateofbirth), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {patient.bloodgroup || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {patient.lastvisit 
                          ? format(new Date(patient.lastvisit), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewPatientDetails(patient)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No patients found.</p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPatient && (
        <PatientDetailsDialog
          patient={selectedPatient}
          open={!!selectedPatient}
          onOpenChange={(open) => !open && setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default PatientHistory;
