
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  TestTube,
  ClipboardList 
} from 'lucide-react';

interface Patient {
  customerid: number;
  firstname: string;
  lastname: string;
  gender?: string;
  dateofbirth?: string;
  bloodgroup?: string;
  lastvisit?: string;
}

interface PatientDetailsDialogProps {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PatientDetailsDialog: React.FC<PatientDetailsDialogProps> = ({
  patient,
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch patient prescriptions
  const { data: prescriptions, isLoading: isPrescriptionsLoading } = useQuery({
    queryKey: ['patient-prescriptions', patient.customerid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          prescriptionid,
          prescriptiondate,
          expirydate,
          prescribingdoctor,
          doctors!inner (firstname, lastname),
          prescriptionitems (
            prescriptionitemid,
            products!inner (productname),
            dosage,
            frequency,
            duration
          )
        `)
        .eq('customerid', patient.customerid)
        .order('prescriptiondate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && patient?.customerid !== undefined
  });

  // Fetch patient visits
  const { data: visits, isLoading: isVisitsLoading } = useQuery({
    queryKey: ['patient-visits', patient.customerid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patientvisits')
        .select(`
          visitid,
          visitdate,
          chiefcomplaint,
          diagnosis,
          treatment,
          notes,
          doctors!inner (firstname, lastname),
          followupdate
        `)
        .eq('customerid', patient.customerid)
        .order('visitdate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && patient?.customerid !== undefined
  });

  // Fetch patient lab orders
  const { data: labOrders, isLoading: isLabOrdersLoading } = useQuery({
    queryKey: ['patient-lab-orders', patient.customerid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laborders')
        .select(`
          orderid,
          orderdate,
          status,
          referredby,
          laborderitems (
            orderitemid,
            labtests (testname),
            testpanels (panelname),
            status
          )
        `)
        .eq('customerid', patient.customerid)
        .order('orderdate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && patient?.customerid !== undefined
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" /> 
            {patient.firstname} {patient.lastname}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="lab">Lab Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p>{patient.dateofbirth ? format(new Date(patient.dateofbirth), 'MMM d, yyyy') : 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p>{patient.gender || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Group</p>
                    <p>{patient.bloodgroup || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Visit</p>
                    <p>{patient.lastvisit ? format(new Date(patient.lastvisit), 'MMM d, yyyy') : 'No prior visits'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="prescriptions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
                <CardDescription>Medication history</CardDescription>
              </CardHeader>
              <CardContent>
                {isPrescriptionsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-10 bg-gray-100 w-full rounded"></div>
                    <div className="h-10 bg-gray-100 w-full rounded"></div>
                  </div>
                ) : prescriptions && prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptions.map((prescription: any) => (
                      <Card key={prescription.prescriptionid} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(prescription.prescriptiondate), 'MMM d, yyyy')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {prescription.doctors ? 
                                  `Dr. ${prescription.doctors.firstname} ${prescription.doctors.lastname}` : 
                                  prescription.prescribingdoctor || 'Unknown doctor'}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              Expires: {prescription.expirydate ? 
                                format(new Date(prescription.expirydate), 'MMM d, yyyy') : 
                                'Not specified'}
                            </div>
                          </div>
                          
                          {prescription.prescriptionitems && prescription.prescriptionitems.length > 0 && (
                            <div className="border rounded-md overflow-hidden mt-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Medication</TableHead>
                                    <TableHead>Dosage</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Duration</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {prescription.prescriptionitems.map((item: any) => (
                                    <TableRow key={item.prescriptionitemid}>
                                      <TableCell>{item.products.productname}</TableCell>
                                      <TableCell>{item.dosage || '-'}</TableCell>
                                      <TableCell>{item.frequency || '-'}</TableCell>
                                      <TableCell>{item.duration || '-'}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No prescription records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visits" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Visit History</CardTitle>
                <CardDescription>Past medical visits</CardDescription>
              </CardHeader>
              <CardContent>
                {isVisitsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-24 bg-gray-100 w-full rounded"></div>
                    <div className="h-24 bg-gray-100 w-full rounded"></div>
                  </div>
                ) : visits && visits.length > 0 ? (
                  <div className="space-y-4">
                    {visits.map((visit: any) => (
                      <Card key={visit.visitid} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(visit.visitdate), 'MMM d, yyyy')}
                              </div>
                              <div className="text-sm text-gray-600">
                                Dr. {visit.doctors.firstname} {visit.doctors.lastname}
                              </div>
                            </div>
                            {visit.followupdate && (
                              <div className="text-sm text-gray-600">
                                Follow-up: {format(new Date(visit.followupdate), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Chief Complaint</p>
                              <p className="text-sm">{visit.chiefcomplaint || 'Not recorded'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Diagnosis</p>
                              <p className="text-sm">{visit.diagnosis || 'Not recorded'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Treatment</p>
                              <p className="text-sm">{visit.treatment || 'Not recorded'}</p>
                            </div>
                            {visit.notes && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Notes</p>
                                <p className="text-sm">{visit.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No visit records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lab" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Laboratory Results</CardTitle>
                <CardDescription>Test results history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLabOrdersLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-24 bg-gray-100 w-full rounded"></div>
                    <div className="h-24 bg-gray-100 w-full rounded"></div>
                  </div>
                ) : labOrders && labOrders.length > 0 ? (
                  <div className="space-y-4">
                    {labOrders.map((order: any) => (
                      <Card key={order.orderid} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <TestTube className="h-4 w-4" />
                                Lab Order #{order.orderid} - {format(new Date(order.orderdate), 'MMM d, yyyy')}
                              </div>
                              <div className="text-sm text-gray-600">
                                Referred by: {order.referredby || 'Not specified'}
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${
                              order.status === 'Completed' ? 'text-green-600' :
                              order.status === 'InProcess' ? 'text-amber-600' :
                              'text-blue-600'
                            }`}>
                              {order.status}
                            </div>
                          </div>
                          
                          {order.laborderitems && order.laborderitems.length > 0 && (
                            <div className="border rounded-md overflow-hidden mt-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Test/Panel</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.laborderitems.map((item: any, idx: number) => (
                                    <TableRow key={item.orderitemid || idx}>
                                      <TableCell>
                                        {item.labtests?.testname || item.testpanels?.panelname || 'Unknown test'}
                                      </TableCell>
                                      <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                          item.status === 'InProcess' ? 'bg-amber-100 text-amber-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {item.status}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No lab records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetailsDialog;
