
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTabs,
  DialogTab
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { 
  CalendarDays, 
  ClipboardList, 
  Clock, 
  FileText, 
  Pill, 
  TestTube, 
  User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PatientDetailsDialogProps {
  patient: {
    customerid: number;
    firstname: string;
    lastname: string;
    gender?: string;
    dateofbirth?: string;
    bloodgroup?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PatientDetailsDialog: React.FC<PatientDetailsDialogProps> = ({
  patient,
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Fetch patient visits
  const { data: visits, isLoading: visitsLoading } = useQuery({
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
          followupdate,
          doctors (
            firstname,
            lastname
          )
        `)
        .eq('customerid', patient.customerid)
        .order('visitdate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch patient prescriptions
  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['patient-prescriptions', patient.customerid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          prescriptionid,
          prescriptiondate,
          expirydate,
          doctors (
            firstname,
            lastname
          ),
          prescribingdoctor,
          prescriptionitems (
            prescriptionitemid,
            dosage,
            frequency,
            duration,
            instructions,
            products (
              productname,
              genericname
            )
          )
        `)
        .eq('customerid', patient.customerid)
        .order('prescriptiondate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch patient lab results
  const { data: labResults, isLoading: labResultsLoading } = useQuery({
    queryKey: ['patient-lab-results', patient.customerid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laborders')
        .select(`
          orderid,
          orderdate,
          laborderitems (
            orderitemid,
            status,
            labtests (
              testid,
              testname
            ),
            testpanels (
              panelid,
              panelname
            ),
            testresults (
              resultid,
              result,
              resultnotes,
              isabnormal
            )
          )
        `)
        .eq('customerid', patient.customerid)
        .order('orderdate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient: {patient.firstname} {patient.lastname}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">
              <ClipboardList className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <Pill className="h-4 w-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="lab-results">
              <TestTube className="h-4 w-4 mr-2" />
              Lab Results
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-grow">
            <TabsContent value="overview" className="m-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Patient Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="text-gray-500">Full Name</div>
                        <div>{patient.firstname} {patient.lastname}</div>
                        
                        <div className="text-gray-500">Gender</div>
                        <div>{patient.gender || 'Not specified'}</div>
                        
                        <div className="text-gray-500">Date of Birth</div>
                        <div>
                          {patient.dateofbirth 
                            ? `${format(new Date(patient.dateofbirth), 'MMM d, yyyy')} (${calculateAge(patient.dateofbirth)} years)`
                            : 'Not specified'}
                        </div>
                        
                        <div className="text-gray-500">Blood Group</div>
                        <div>{patient.bloodgroup || 'Not specified'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Visit History
                    </h3>
                    
                    {visitsLoading ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    ) : visits && visits.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">Latest Visits:</div>
                        <div className="space-y-1">
                          {visits.slice(0, 3).map((visit) => (
                            <div key={visit.visitid} className="flex justify-between">
                              <div>{format(new Date(visit.visitdate), 'MMM d, yyyy')}</div>
                              <div>{visit.diagnosis || 'No diagnosis recorded'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No visit history found</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">Medical History</h3>
                  
                  {visitsLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-20 bg-gray-100 rounded w-full"></div>
                    </div>
                  ) : visits && visits.length > 0 ? (
                    <div className="space-y-4">
                      {visits.map((visit) => (
                        <div key={visit.visitid} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{format(new Date(visit.visitdate), 'MMMM d, yyyy')}</div>
                            <div className="text-gray-500 text-sm">
                              Dr. {visit.doctors?.firstname} {visit.doctors?.lastname}
                            </div>
                          </div>
                          
                          {visit.chiefcomplaint && (
                            <div className="mb-2">
                              <div className="text-sm font-medium text-gray-500">Chief Complaint</div>
                              <div>{visit.chiefcomplaint}</div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {visit.diagnosis && (
                              <div>
                                <div className="text-sm font-medium text-gray-500">Diagnosis</div>
                                <div>{visit.diagnosis}</div>
                              </div>
                            )}
                            
                            {visit.treatment && (
                              <div>
                                <div className="text-sm font-medium text-gray-500">Treatment</div>
                                <div>{visit.treatment}</div>
                              </div>
                            )}
                          </div>
                          
                          {visit.notes && (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-gray-500">Notes</div>
                              <div>{visit.notes}</div>
                            </div>
                          )}
                          
                          {visit.followupdate && (
                            <div className="mt-2 text-sm flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Follow-up scheduled for {format(new Date(visit.followupdate), 'MMMM d, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No medical history available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prescriptions" className="m-0">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Prescription History</h3>
                    <Button asChild size="sm">
                      <Link to={`/prescriptions/new?patientId=${patient.customerid}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        New Prescription
                      </Link>
                    </Button>
                  </div>
                  
                  {prescriptionsLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-20 bg-gray-100 rounded w-full"></div>
                      <div className="h-20 bg-gray-100 rounded w-full"></div>
                    </div>
                  ) : prescriptions && prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map((prescription) => (
                        <Card key={prescription.prescriptionid} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-medium">
                                  Prescription #{prescription.prescriptionid}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(prescription.prescriptiondate), 'MMMM d, yyyy')}
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-500">
                                {prescription.doctors 
                                  ? `Dr. ${prescription.doctors.firstname} ${prescription.doctors.lastname}`
                                  : prescription.prescribingdoctor || 'Unknown doctor'}
                              </div>
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="space-y-2">
                              {prescription.prescriptionitems?.map((item, index) => (
                                <div key={item.prescriptionitemid} className="flex flex-col">
                                  <div className="font-medium">
                                    {item.products?.productname}
                                    {item.products?.genericname && ` (${item.products.genericname})`}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {item.dosage && `${item.dosage}, `}
                                    {item.frequency && `${item.frequency}, `}
                                    {item.duration && `for ${item.duration}`}
                                  </div>
                                  {item.instructions && (
                                    <div className="text-sm text-gray-500 italic mt-1">
                                      {item.instructions}
                                    </div>
                                  )}
                                  
                                  {index < prescription.prescriptionitems.length - 1 && (
                                    <Separator className="my-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No prescription history available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="lab-results" className="m-0">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Laboratory Results</h3>
                  </div>
                  
                  {labResultsLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-20 bg-gray-100 rounded w-full"></div>
                      <div className="h-20 bg-gray-100 rounded w-full"></div>
                    </div>
                  ) : labResults && labResults.length > 0 ? (
                    <div className="space-y-4">
                      {labResults.map((order) => (
                        <Card key={order.orderid} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-medium">
                                  Lab Order #{order.orderid}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(order.orderdate), 'MMMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="space-y-3">
                              {order.laborderitems?.map((item) => {
                                const testName = item.labtests?.testname || item.testpanels?.panelname;
                                const hasResults = item.testresults && item.testresults.length > 0;
                                
                                return (
                                  <div key={item.orderitemid} className="space-y-2">
                                    <div className="font-medium">{testName || 'Unknown Test'}</div>
                                    
                                    {hasResults ? (
                                      <div>
                                        {item.testresults.map((result) => (
                                          <div key={result.resultid} className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span>Result:</span>
                                              <span className={result.isabnormal ? 'text-red-600 font-medium' : ''}>
                                                {result.result}
                                                {result.isabnormal && ' (Abnormal)'}
                                              </span>
                                            </div>
                                            
                                            {result.resultnotes && (
                                              <div className="text-sm text-gray-600">
                                                Notes: {result.resultnotes}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-500">
                                        Status: {item.status || 'Pending'}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No laboratory results available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetailsDialog;
