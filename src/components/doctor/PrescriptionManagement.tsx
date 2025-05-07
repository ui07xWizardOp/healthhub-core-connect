
import React, { useState, useEffect } from 'react';
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
import { FileText, Plus, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import PrescriptionForm from '@/components/pharmacy/PrescriptionForm';

interface Prescription {
  prescriptionid: number;
  customerid: number;
  customerFirstName: string;
  customerLastName: string;
  prescriptiondate: string;
  expirydate: string | null;
  itemCount: number;
}

const PrescriptionManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  
  // Fetch doctor's prescriptions using direct query instead of RPC
  const { data: prescriptions, isLoading, refetch } = useQuery({
    queryKey: ['doctor-prescriptions', userProfile?.doctorId],
    queryFn: async () => {
      // Using direct query instead of RPC
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          prescriptionid,
          customerid,
          prescriptiondate,
          expirydate,
          users!inner (firstname, lastname),
          prescriptionitems (prescriptionitemid)
        `)
        .eq('doctorid', userProfile?.doctorId);
      
      if (error) throw error;
      
      // Transform the data to match our expected format
      return data.map((prescription) => ({
        prescriptionid: prescription.prescriptionid,
        customerid: prescription.customerid,
        customerFirstName: prescription.users.firstname,
        customerLastName: prescription.users.lastname,
        prescriptiondate: prescription.prescriptiondate,
        expirydate: prescription.expirydate,
        itemcount: prescription.prescriptionitems?.length || 0
      })) || [];
    },
    enabled: !!userProfile?.doctorId
  });

  // Filter prescriptions based on search query
  const filteredPrescriptions = prescriptions ? prescriptions.filter(
    (prescription: Prescription) => {
      const fullName = `${prescription.customerFirstName} ${prescription.customerLastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || 
             prescription.prescriptionid.toString().includes(searchQuery);
    }
  ) : [];

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
  };

  const handleClosePrescriptionDialog = () => {
    setSelectedPrescription(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Prescriptions</CardTitle>
            <CardDescription>
              View and manage prescriptions for your patients
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/prescriptions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Link>
          </Button>
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
            <div className="animate-pulse">
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full rounded"></div>
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
                  {filteredPrescriptions.map((prescription: any) => (
                    <TableRow key={prescription.prescriptionid}>
                      <TableCell className="font-medium">{prescription.prescriptionid}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
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
                          onClick={() => handleViewPrescription(prescription)}
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
              <p className="text-gray-500">No prescriptions found.</p>
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
      
      {selectedPrescription && (
        <PrescriptionForm
          prescription={selectedPrescription}
          onClose={handleClosePrescriptionDialog}
        />
      )}
    </div>
  );
};

export default PrescriptionManagement;
