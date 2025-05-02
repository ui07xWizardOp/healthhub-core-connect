import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TestTube, FlaskRound, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LabTestForm from '@/components/laboratory/LabTestForm';
import TestResultForm from '@/components/laboratory/TestResultForm';

interface User {
  firstname?: string;
  lastname?: string;
}

interface LabOrder {
  orderid: number;
  customerid: number;
  orderdate: string;
  totalamount: number;
  status: string;
  users?: User;
}

const Laboratory = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTestForm, setShowTestForm] = useState<boolean>(false);
  const [showResultForm, setShowResultForm] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();
  
  // Fetch lab tests
  const { data: labtests, isLoading: loadingTests, refetch: refetchTests } = useQuery({
    queryKey: ['labtests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labtests')
        .select(`
          *,
          testcategories(categoryname)
        `)
        .order('testname', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch recent lab orders with customer information
  const { data: laborders, isLoading: loadingOrders, refetch: refetchOrders } = useQuery<LabOrder[]>({
    queryKey: ['lab-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laborders')
        .select(`
          *,
          users:customerid(firstname, lastname)
        `)
        .order('orderdate', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch test statistics
  const { data: labStats } = useQuery({
    queryKey: ['lab-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labstats')
        .select('*')
        .order('date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] : {
        totaltests: 0,
        totalpanels: 0,
        totalrevenue: 0
      };
    }
  });

  // Fetch orders with pending results
  const { data: pendingResults } = useQuery({
    queryKey: ['pending-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laborderitems')
        .select('*')
        .eq('status', 'Processing')
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch recently collected samples
  const { data: recentSamples } = useQuery({
    queryKey: ['recent-samples'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('samplecollection')
        .select('*')
        .order('collectiondatetime', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Handle opening test form
  const handleAddTest = () => {
    setSelectedTest(null);
    setShowTestForm(true);
  };

  // Handle editing a test
  const handleEditTest = (test: any) => {
    setSelectedTest(test);
    setShowTestForm(true);
  };

  // Handle processing results
  const handleProcessResults = (order: any) => {
    setSelectedOrder(order);
    setShowResultForm(true);
  };

  // Filter tests based on search query
  const filteredTests = labtests?.filter(test => {
    return test.testname.toLowerCase().includes(searchQuery.toLowerCase()) ||
           test.testingmethod?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           test.testcategories?.categoryname?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Format currency 
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Laboratory Management</h1>
          <Button 
            onClick={handleAddTest}
            className="bg-[#FE654F] hover:bg-[#FE654F]/90 mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Test
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {loadingTests ? '...' : labtests?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Available tests</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <TestTube className="text-[#FE654F] h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Samples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {recentSamples?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Collected samples</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <FlaskRound className="text-[#FE654F] h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {pendingResults?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Pending results</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100">
                  <TestTube className="text-[#FE654F] h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="orders" className="mb-8">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="tests">Test Catalog</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="mr-2 h-5 w-5" />
                  Recent Test Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="text-center py-8">Loading recent orders...</div>
                ) : laborders?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent lab orders found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {laborders?.map((order) => (
                          <TableRow key={order.orderid}>
                            <TableCell>LAB-{order.orderid}</TableCell>
                            <TableCell>{order.users ? `${order.users.firstname || 'Unknown'} ${order.users.lastname || 'User'}` : 'Unknown'}</TableCell>
                            <TableCell>{new Date(order.orderdate).toLocaleDateString()}</TableCell>
                            <TableCell>{formatCurrency(order.totalamount)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(order.status)}>
                                {order.status || 'Processing'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleProcessResults(order)}>
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
          
          <TabsContent value="tests" className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                <CardTitle className="flex items-center">
                  <TestTube className="mr-2 h-5 w-5" />
                  Test Catalog
                </CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search tests..."
                    className="pl-9 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingTests ? (
                  <div className="text-center py-8">Loading tests...</div>
                ) : filteredTests?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tests matching your search
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Sample Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTests?.map((test) => (
                          <TableRow key={test.testid}>
                            <TableCell className="font-medium">{test.testname}</TableCell>
                            <TableCell>{test.testcategories?.categoryname || 'Uncategorized'}</TableCell>
                            <TableCell>{test.sampletype || 'N/A'}</TableCell>
                            <TableCell>{formatCurrency(test.price || 0)}</TableCell>
                            <TableCell>
                              <Badge className={test.isactive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {test.isactive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleEditTest(test)}>
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
        </Tabs>

        {showTestForm && (
          <LabTestForm 
            test={selectedTest} 
            onClose={() => {
              setShowTestForm(false);
              refetchTests();
            }} 
          />
        )}

        {showResultForm && (
          <TestResultForm 
            order={selectedOrder} 
            onClose={() => {
              setShowResultForm(false);
              refetchOrders();
            }} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Laboratory;
