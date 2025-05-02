
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  PlusCircle, 
  PillIcon, 
  ShoppingBag, 
  ClipboardList 
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PrescriptionForm from '@/components/pharmacy/PrescriptionForm';
import MedicationForm from '@/components/pharmacy/MedicationForm';

interface User {
  firstname?: string | null;
  lastname?: string | null;
}

interface Prescription {
  prescriptionid: number;
  customerid: number | null;
  doctorid: number | null;
  prescriptiondate: string | null;
  expirydate: string | null;
  customer?: User | null;
  doctor?: User | null;
  prescribingdoctor?: string | null;
}

interface Sale {
  saleid: number;
  saledate: string | null;
  totalamount: number;
  status: string | null;
  paymentmethod?: string | null;
  customer?: User | null;
}

interface Medication {
  productid: number;
  productname: string;
  genericname?: string | null;
  categoryid?: number | null;
  isactive: boolean;
  requiresprescription?: boolean | null;
  currentStock?: number;
  categories?: {
    categoryname: string;
  } | null;
}

const Pharmacy = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState<boolean>(false);
  const [showMedicationForm, setShowMedicationForm] = useState<boolean>(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const { toast } = useToast();
  
  // Fetch medications (products)
  const { data: medications, isLoading: loadingMedications, refetch: refetchMedications } = useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(categoryname)
        `)
        .order('productname', { ascending: true });
      
      if (error) throw error;
      
      // Get stock information for each product
      const productsWithStock = await Promise.all(data?.map(async (product) => {
        const { data: batches, error: batchError } = await supabase
          .from('batchinventory')
          .select('quantityinstock, expirydate')
          .eq('productid', product.productid)
          .eq('isactive', true);
        
        if (batchError) throw batchError;
        
        const totalStock = batches?.reduce((sum, batch) => sum + (batch.quantityinstock || 0), 0) || 0;
        
        return {
          ...product,
          currentStock: totalStock
        };
      }) || []);
      
      return productsWithStock;
    }
  });
  
  // Fetch prescriptions
  const { data: prescriptions, isLoading: loadingPrescriptions, refetch: refetchPrescriptions } = useQuery<Prescription[]>({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          customer:customerid(firstname, lastname),
          doctor:doctorid(firstname, lastname)
        `)
        .order('prescriptiondate', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as Prescription[];
    }
  });

  // Fetch recent sales
  const { data: recentSales } = useQuery<Sale[]>({
    queryKey: ['recent-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customerid(firstname, lastname)
        `)
        .order('saledate', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as Sale[];
    }
  });

  // Filter medications based on search query
  const filteredMedications = medications?.filter(med => {
    const searchTerms = searchQuery.toLowerCase().trim();
    return med.productname.toLowerCase().includes(searchTerms) || 
           med.genericname?.toLowerCase().includes(searchTerms) ||
           med.categories?.categoryname?.toLowerCase().includes(searchTerms);
  });

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle adding new medication
  const handleAddMedication = () => {
    setSelectedMedication(null);
    setShowMedicationForm(true);
  };

  // Handle editing medication
  const handleEditMedication = (medication: any) => {
    setSelectedMedication(medication);
    setShowMedicationForm(true);
  };

  // Handle adding new prescription
  const handleAddPrescription = () => {
    setSelectedPrescription(null);
    setShowPrescriptionForm(true);
  };

  // Handle viewing prescription
  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionForm(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Pharmacy Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            <Button 
              onClick={handleAddPrescription}
              className="bg-[#FE654F] hover:bg-[#FE654F]/90"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
            <Button 
              onClick={handleAddMedication}
              className="bg-[#FE654F] hover:bg-[#FE654F]/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {loadingMedications ? '...' : medications?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Total medications</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <PillIcon className="text-[#FE654F] h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {loadingPrescriptions ? '...' : prescriptions?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Active prescriptions</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <ClipboardList className="text-[#FE654F] h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {recentSales?.filter(sale => sale.status?.toLowerCase() === 'pending').length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Pending orders</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100">
                  <ShoppingBag className="text-[#FE654F] h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="prescriptions" className="mb-8">
          <TabsList>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="sales">Recent Sales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prescriptions" className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Prescriptions
                </CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search prescriptions..."
                    className="pl-9 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingPrescriptions ? (
                  <div className="text-center py-8">Loading prescriptions...</div>
                ) : prescriptions && prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No prescriptions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptions && prescriptions.map((prescription) => (
                          <TableRow key={prescription.prescriptionid}>
                            <TableCell>PRE-{prescription.prescriptionid}</TableCell>
                            <TableCell>
                              {prescription.customer ? 
                                `${prescription.customer.firstname || 'Unknown'} ${prescription.customer.lastname || 'User'}` : 
                                prescription.prescribingdoctor || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {prescription.doctor ? 
                                `Dr. ${prescription.doctor.firstname || ''} ${prescription.doctor.lastname || ''}` : 
                                'N/A'}
                            </TableCell>
                            <TableCell>{prescription.prescriptiondate ? new Date(prescription.prescriptiondate).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>
                              {prescription.expirydate ? 
                                new Date(prescription.expirydate).toLocaleDateString() : 
                                'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewPrescription(prescription)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="medications" className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                <CardTitle className="flex items-center">
                  <PillIcon className="mr-2 h-5 w-5" />
                  Medications
                </CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search medications..."
                    className="pl-9 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingMedications ? (
                  <div className="text-center py-8">Loading medications...</div>
                ) : filteredMedications && filteredMedications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No medications matching your search
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Generic Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead>Requires Rx</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMedications && filteredMedications.map((medication) => (
                          <TableRow key={medication.productid} className={!medication.isactive ? 'bg-gray-50 opacity-70' : ''}>
                            <TableCell className="font-medium">{medication.productname}</TableCell>
                            <TableCell>{medication.genericname || 'N/A'}</TableCell>
                            <TableCell>{medication.categories?.categoryname || 'Uncategorized'}</TableCell>
                            <TableCell className={`text-right ${
                              medication.currentStock <= 10
                                ? 'text-red-500 font-semibold' 
                                : ''
                            }`}>
                              {medication.currentStock || 0}
                            </TableCell>
                            <TableCell>
                              {medication.requiresprescription ? (
                                <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">OTC</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditMedication(medication)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales" className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Recent Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSales && recentSales.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent sales found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentSales && recentSales.map((sale) => (
                          <TableRow key={sale.saleid}>
                            <TableCell>SALE-{sale.saleid}</TableCell>
                            <TableCell>
                              {sale.customer ? 
                                `${sale.customer.firstname || 'Unknown'} ${sale.customer.lastname || 'Customer'}` : 
                                'Walk-in Customer'}
                            </TableCell>
                            <TableCell>{sale.saledate ? new Date(sale.saledate).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(sale.totalamount || 0)}
                            </TableCell>
                            <TableCell>{sale.paymentmethod || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(sale.status || '')}>
                                {sale.status || 'Processing'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {showPrescriptionForm && (
          <PrescriptionForm 
            prescription={selectedPrescription} 
            onClose={() => {
              setShowPrescriptionForm(false);
              refetchPrescriptions();
            }} 
          />
        )}
        
        {showMedicationForm && (
          <MedicationForm 
            medication={selectedMedication} 
            onClose={() => {
              setShowMedicationForm(false);
              refetchMedications();
            }} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Pharmacy;
