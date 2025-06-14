
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface PrescriptionDetailsDialogProps {
  prescriptionId: number;
  onClose: () => void;
}

const PrescriptionDetailsDialog: React.FC<PrescriptionDetailsDialogProps> = ({ prescriptionId, onClose }) => {
  const { data: prescriptionDetails, isLoading } = useQuery({
    queryKey: ['prescriptionDetails', prescriptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          prescriptionid,
          prescriptiondate,
          expirydate,
          notes,
          users!inner (firstname, lastname, email),
          prescriptionitems (
            dosage,
            frequency,
            duration,
            quantity,
            instructions,
            products (productname, strength)
          )
        `)
        .eq('prescriptionid', prescriptionId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Prescription Details</DialogTitle>
          {prescriptionDetails && <DialogDescription>For prescription ID: {prescriptionDetails.prescriptionid}</DialogDescription>}
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <div className="border rounded-md mt-4">
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : prescriptionDetails ? (
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-800">Patient Information</h3>
                <p className="text-sm">{prescriptionDetails.users?.firstname} {prescriptionDetails.users?.lastname}</p>
                <p className="text-xs text-muted-foreground">{prescriptionDetails.users?.email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Prescription Information</h3>
                <p className="text-sm">Date Issued: {format(new Date(prescriptionDetails.prescriptiondate), 'PPP')}</p>
                {prescriptionDetails.expirydate && <p className="text-sm">Expires On: {format(new Date(prescriptionDetails.expirydate), 'PPP')}</p>}
              </div>
            </div>
            {prescriptionDetails.notes && (
              <div>
                <h3 className="font-semibold text-gray-800">Notes</h3>
                <p className="text-sm p-3 bg-gray-50 rounded-md border">{prescriptionDetails.notes}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Medications</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Instructions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptionDetails.prescriptionitems.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.products.productname} <Badge variant="secondary">{item.products.strength}</Badge></TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{item.dosage || '-'}</span>
                            <span className="text-xs text-muted-foreground">{item.frequency || ''} {item.duration ? ` for ${item.duration}`: ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity || '-'}</TableCell>
                        <TableCell>{item.instructions || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500 py-4">Could not load prescription details.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDetailsDialog;

