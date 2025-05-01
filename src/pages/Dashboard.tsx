
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PillIcon, 
  TestTube, 
  Users, 
  ShoppingCart,
  TrendingUp,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { supabase } from "@/integrations/supabase/client";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalTests: 0,
    totalCustomers: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sample data for charts
  const salesData = [
    { name: 'Jan', pharmacy: 4000, laboratory: 2400 },
    { name: 'Feb', pharmacy: 3000, laboratory: 1398 },
    { name: 'Mar', pharmacy: 2000, laboratory: 9800 },
    { name: 'Apr', pharmacy: 2780, laboratory: 3908 },
    { name: 'May', pharmacy: 1890, laboratory: 4800 },
    { name: 'Jun', pharmacy: 2390, laboratory: 3800 },
    { name: 'Jul', pharmacy: 3490, laboratory: 4300 },
  ];

  const productData = [
    { name: 'Pain Relief', value: 4000 },
    { name: 'Antibiotics', value: 3000 },
    { name: 'Vitamins', value: 2000 },
    { name: 'Cold & Flu', value: 2780 },
    { name: 'Skin Care', value: 1890 },
  ];

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch total products count
        const { count: medicineCount, error: medicineError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (medicineError) throw medicineError;

        // Fetch total tests count
        const { count: testCount, error: testError } = await supabase
          .from('labtests')
          .select('*', { count: 'exact', head: true });
        
        if (testError) throw testError;

        // Fetch total customers count
        const { count: customerCount, error: customerError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (customerError) throw customerError;

        // Fetch total orders count
        const { count: orderCount, error: orderError } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true });
        
        if (orderError) throw orderError;

        setStats({
          totalMedicines: medicineCount || 0,
          totalTests: testCount || 0,
          totalCustomers: customerCount || 0,
          totalOrders: orderCount || 0
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error.message);
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
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Medicines</CardTitle>
              <div className="p-2 rounded-full bg-[#FED99B]/20">
                <PillIcon className="text-[#FE654F] h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.totalMedicines}</div>
              <div className="flex items-center mt-1 text-xs">
                <TrendingUp className="text-green-500 h-3 w-3 mr-1" />
                <span className="text-green-500">+15%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Lab Tests</CardTitle>
              <div className="p-2 rounded-full bg-[#D6EFFF]/40">
                <TestTube className="text-[#FE654F] h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.totalTests}</div>
              <div className="flex items-center mt-1 text-xs">
                <TrendingUp className="text-green-500 h-3 w-3 mr-1" />
                <span className="text-green-500">+8%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Customers</CardTitle>
              <div className="p-2 rounded-full bg-[#FED18C]/30">
                <Users className="text-[#FE654F] h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.totalCustomers}</div>
              <div className="flex items-center mt-1 text-xs">
                <TrendingUp className="text-green-500 h-3 w-3 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Orders</CardTitle>
              <div className="p-2 rounded-full bg-[#FE654F]/10">
                <ShoppingCart className="text-[#FE654F] h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.totalOrders}</div>
              <div className="flex items-center mt-1 text-xs">
                <TrendingUp className="text-green-500 h-3 w-3 mr-1" />
                <span className="text-green-500">+10%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    pharmacy: {
                      label: "Pharmacy",
                      color: "#FE654F",
                    },
                    laboratory: {
                      label: "Laboratory",
                      color: "#D6EFFF",
                    },
                  }}
                >
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorPharmacy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FE654F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FE654F" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLaboratory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D6EFFF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D6EFFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area type="monotone" dataKey="pharmacy" stroke="#FE654F" fillOpacity={1} fill="url(#colorPharmacy)" />
                    <Area type="monotone" dataKey="laboratory" stroke="#82ca9d" fillOpacity={1} fill="url(#colorLaboratory)" />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    value: {
                      label: "Sales",
                      color: "#FED18C",
                    },
                  }}
                >
                  <BarChart data={productData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#FED18C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="pharmacy" className="mb-8">
          <TabsList className="bg-[#D6EFFF]/20">
            <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
            <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
          </TabsList>
          <TabsContent value="pharmacy" className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">ID</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Patient</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Medication</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Date</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((item) => (
                        <tr key={item} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2">PRE-{10000 + item}</td>
                          <td className="p-2">Patient {item}</td>
                          <td className="p-2">Medication {item}</td>
                          <td className="p-2">{new Date().toLocaleDateString()}</td>
                          <td className="p-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Filled
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="laboratory" className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">ID</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Patient</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Test Type</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Date</th>
                        <th className="text-left text-sm font-medium text-gray-500 p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((item) => (
                        <tr key={item} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2">TEST-{20000 + item}</td>
                          <td className="p-2">Patient {item}</td>
                          <td className="p-2">Blood Test</td>
                          <td className="p-2">{new Date().toLocaleDateString()}</td>
                          <td className="p-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Processing
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
