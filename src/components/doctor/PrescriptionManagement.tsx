
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText, Search, User } from 'lucide-react';
import PrescriptionDetailsDialog from '@/components/doctor/PrescriptionDetailsDialog';

interface Prescription {
  prescriptionid: number;
  customerid: number;
  customerFirstName: string;
  customerLastName: string;
  prescriptiondate: string;
  expirydate: string | null;
  itemcount: number;
}

const PrescriptionManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
  
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['doctor-prescriptions', userProfile?.doctorId],
    queryFn: async () => {
      if (!userProfile?.doctorId) return [];
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          prescriptionid,
          customerid,
          prescriptiondate,
          expirydate,
          customerprofiles!inner(users!inner(firstname, lastname)),
          prescriptionitems (prescriptionitemid)
        `)
        .eq('doctorid', userProfile?.doctorId)
        .order('prescriptiondate', { ascending: false });
      
      if (error) throw error;
      
      return data.map((prescription: any) => ({
        prescriptionid: prescription.prescriptionid,
        customerid: prescription.customerid,
        customerFirstName: prescription.customerprofiles.users.firstname,
        customerLastName: prescription.customerprofiles.users.lastname,
        prescriptiondate: prescription.prescriptiondate,
        expirydate: prescription.expirydate,
        itemcount: prescription.prescriptionitems?.length || 0
      })) || [];
    },
    enabled: !!userProfile?.doctorId
  });

  const filteredPrescriptions = prescriptions ? prescriptions.filter(
    (prescription: Prescription) => {
      const fullName = `${prescription.customerFirstName} ${prescription.customerLastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || 
             prescription.prescriptionid.toString().includes(searchQuery);
    }
  ) : [];

  const handleViewPrescription = (prescriptionId: number) => {
    setSelectedPrescriptionId(prescriptionId);
  };

  const handleClosePrescriptionDialog = () => {
    setSelectedPrescriptionId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Issued Prescriptions</CardTitle>
          <CardDescription>
            View and manage prescriptions you have issued for your patients.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search by patient name or prescription ID"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 animate-pulse w-full rounded"></div>
              <div className="h-10 bg-gray-200 animate-pulse w-full rounded"></div>
              <div className="h-10 bg-gray-200 animate-pulse w-full rounded"></div>
            </div>
          ) : filteredPrescriptions && filteredPrescriptions.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Expiry</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription: Prescription) => (
                    <TableRow key={prescription.prescriptionid}>
                      <TableCell className="font-medium">{prescription.prescriptionid}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {prescription.customerFirstName} {prescription.customerLastName}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(prescription.prescriptiondate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {prescription.expirydate 
                          ? format(new Date(prescription.expirydate), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{prescription.itemcount}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPrescription(prescription.prescriptionid)}
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
            <div className="text-center py-10 border rounded-md">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? "Try a different search term." : "New prescriptions you create will appear here."}
              </p>
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
      
      {selectedPrescriptionId && (
        <PrescriptionDetailsDialog
          prescriptionId={selectedPrescriptionId}
          onClose={handleClosePrescriptionDialog}
        />
      )}
    </div>
  );
};

export default PrescriptionManagement;

