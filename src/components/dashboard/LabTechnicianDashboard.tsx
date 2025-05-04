
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TestTube, 
  AlertCircle,
  ChevronRight,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart4
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LabTechnicianDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    pendingSamples: 0,
    completedTests: 0,
    abnormalResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sample data for test statistics
  const commonTests = [
    { name: "Complete Blood Count", count: 28 },
    { name: "Blood Glucose Fasting", count: 22 },
    { name: "Lipid Profile", count: 18 },
    { name: "Liver Function Test", count: 15 },
    { name: "Kidney Function Test", count: 12 }
  ];

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch pending lab orders count
        const { count: pendingOrdersCount, error: pendingOrdersError } = await supabase
          .from('laborders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['Ordered', 'SampleCollected', 'InProcess']);
        
        if (pendingOrdersError) throw pendingOrdersError;

        // Fetch pending samples count
        const { count: pendingSamplesCount, error: pendingSamplesError } = await supabase
          .from('laborders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Ordered');
        
        if (pendingSamplesError) throw pendingSamplesError;

        // Fetch completed tests count
        const { count: completedCount, error: completedError } = await supabase
          .from('laborderitems')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Completed');
        
        if (completedError) throw completedError;

        // Fetch abnormal results count
        const { count: abnormalCount, error: abnormalError } = await supabase
          .from('testresults')
          .select('*', { count: 'exact', head: true })
          .eq('isabnormal', true);
        
        if (abnormalError) throw abnormalError;

        setStats({
          pendingOrders: pendingOrdersCount || 0,
          pendingSamples: pendingSamplesCount || 0,
          completedTests: completedCount || 0,
          abnormalResults: abnormalCount || 0,
        });
      } catch (error: any) {
        console.error('Error fetching lab technician dashboard data:', error.message);
        toast({
          title: "Error fetching dashboard data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lab Technician Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
            <div className="p-2 rounded-full bg-amber-50">
              <Clock className="text-amber-500 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.pendingOrders}</div>
            <div className="mt-2">
              <Button variant="ghost" className="p-0 h-auto text-sm text-amber-600 hover:text-amber-700">
                View orders <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Samples</CardTitle>
            <div className="p-2 rounded-full bg-blue-50">
              <TestTube className="text-blue-500 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.pendingSamples}</div>
            <div className="mt-2">
              <Button variant="ghost" className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700">
                Collect samples <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Tests</CardTitle>
            <div className="p-2 rounded-full bg-green-50">
              <CheckCircle className="text-green-500 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.completedTests}</div>
            <div className="mt-2">
              <Button variant="ghost" className="p-0 h-auto text-sm text-green-600 hover:text-green-700">
                View completed <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Abnormal Results</CardTitle>
            <div className="p-2 rounded-full bg-red-50">
              <AlertTriangle className="text-red-500 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.abnormalResults}</div>
            <div className="mt-2">
              <Button variant="ghost" className="p-0 h-auto text-sm text-red-600 hover:text-red-700">
                Review abnormal <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
              <TestTube className="h-5 w-5" />
              <span>Record Sample Collection</span>
            </Button>
            
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200">
              <FileCheck className="h-5 w-5" />
              <span>Enter Test Results</span>
            </Button>
            
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200">
              <BarChart4 className="h-5 w-5" />
              <span>Generate Lab Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="pending">Pending Lab Orders</TabsTrigger>
          <TabsTrigger value="samples">Sample Collection</TabsTrigger>
          <TabsTrigger value="abnormal">Abnormal Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Pending Lab Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Order ID</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Patient</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Tests</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Order Date</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Status</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <tr key={item} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2">LAB-{10000 + item}</td>
                        <td className="p-2">Patient {item}</td>
                        <td className="p-2">{item} test{item > 1 ? 's' : ''}</td>
                        <td className="p-2">{new Date().toLocaleDateString()}</td>
                        <td className="p-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                            {item % 2 === 0 ? 'Ordered' : 'Sample Collected'}
                          </span>
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">Process</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loading && <p className="text-center py-4">Loading pending orders...</p>}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="samples">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Samples Requiring Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Order ID</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Patient</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Sample Type</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Tests</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((item) => (
                      <tr key={item} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2">LAB-{10000 + item}</td>
                        <td className="p-2">Patient {item}</td>
                        <td className="p-2">{item === 1 ? 'Blood' : item === 2 ? 'Urine' : 'Blood & Urine'}</td>
                        <td className="p-2">{item + 1} test{item > 0 ? 's' : ''}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                            Collect Sample
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loading && <p className="text-center py-4">Loading pending samples...</p>}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="abnormal">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Abnormal Results Requiring Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Test ID</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Patient</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Test Name</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Result</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Normal Range</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2].map((item) => (
                      <tr key={item} className="border-b border-gray-100 hover:bg-gray-50 bg-red-50">
                        <td className="p-2">TEST-{20000 + item}</td>
                        <td className="p-2">Patient {item}</td>
                        <td className="p-2">{item === 1 ? 'Blood Glucose' : 'Cholesterol'}</td>
                        <td className="p-2 font-medium text-red-700">
                          {item === 1 ? '210 mg/dL' : '245 mg/dL'}
                        </td>
                        <td className="p-2 text-sm">
                          {item === 1 ? '70-100 mg/dL' : '< 200 mg/dL'}
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loading && <p className="text-center py-4">Loading abnormal results...</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Most Common Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commonTests.map((test, index) => (
              <div key={index} className="flex items-center">
                <div className="w-64 mr-4">
                  <span className="text-sm font-medium">{test.name}</span>
                </div>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-healthhub-orange" 
                    style={{ width: `${(test.count / commonTests[0].count) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-4 text-sm font-medium">{test.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabTechnicianDashboard;
