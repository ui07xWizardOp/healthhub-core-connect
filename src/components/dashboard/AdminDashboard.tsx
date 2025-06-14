import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PillIcon, 
  TestTube, 
  Users, 
  ShoppingCart,
  TrendingUp,
  Calendar,
  Settings,
  User,
  Bell
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalTests: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalAppointments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  console.log('AdminDashboard - userProfile:', userProfile);
  console.log('AdminDashboard - user roles:', userProfile?.roles);

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

  const userGrowthData = [
    { name: 'Jan', count: 20 },
    { name: 'Feb', count: 35 },
    { name: 'Mar', count: 55 },
    { name: 'Apr', count: 72 },
    { name: 'May', count: 90 },
    { name: 'Jun', count: 110 },
    { name: 'Jul', count: 135 },
  ];

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        console.log('Fetching admin dashboard data...');
        
        // Use Promise.all to fetch all data in parallel
        const [
          medicineResult,
          testResult,
          customerResult,
          orderResult,
          appointmentResult,
          salesResult
        ] = await Promise.all([
          // Fetch total products count
          supabase.from('products').select('*', { count: 'exact', head: true }),
          // Fetch total tests count
          supabase.from('labtests').select('*', { count: 'exact', head: true }),
          // Fetch total customers count
          supabase.from('customerprofiles').select('*', { count: 'exact', head: true }),
          // Fetch total orders count
          supabase.from('sales').select('*', { count: 'exact', head: true }),
          // Fetch total appointments count
          supabase.from('appointments').select('*', { count: 'exact', head: true }),
          // Calculate total revenue
          supabase.from('sales').select('netamount')
        ]);

        // Check for errors
        if (medicineResult.error) {
          console.error('Medicine fetch error:', medicineResult.error);
          throw medicineResult.error;
        }
        if (testResult.error) {
          console.error('Test fetch error:', testResult.error);
          throw testResult.error;
        }
        if (customerResult.error) {
          console.error('Customer fetch error:', customerResult.error);
          throw customerResult.error;
        }
        if (orderResult.error) {
          console.error('Order fetch error:', orderResult.error);
          throw orderResult.error;
        }
        if (appointmentResult.error) {
          console.error('Appointment fetch error:', appointmentResult.error);
          throw appointmentResult.error;
        }
        if (salesResult.error) {
          console.error('Sales fetch error:', salesResult.error);
          throw salesResult.error;
        }

        // Calculate total revenue
        const totalRevenue = salesResult.data?.reduce(
          (sum, sale) => sum + (Number(sale.netamount) || 0), 
          0
        ) || 0;

        const newStats = {
          totalMedicines: medicineResult.count || 0,
          totalTests: testResult.count || 0,
          totalCustomers: customerResult.count || 0,
          totalOrders: orderResult.count || 0,
          totalAppointments: appointmentResult.count || 0,
          totalRevenue: totalRevenue
        };

        console.log('Admin dashboard stats loaded:', newStats);
        setStats(newStats);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {userProfile?.firstname} {userProfile?.lastname}</p>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 text-gray-500" />
          <Settings className="h-5 w-5 text-gray-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <div className="p-2 rounded-full bg-[#D6EFFF]/20">
              <TrendingUp className="text-green-500 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${loading ? '...' : stats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="text-green-500 h-3 w-3 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Users</CardTitle>
            <div className="p-2 rounded-full bg-[#FED18C]/30">
              <Users className="text-[#FE654F] h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalCustomers}</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="text-green-500 h-3 w-3 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Appointments</CardTitle>
            <div className="p-2 rounded-full bg-[#FED99B]/20">
              <Calendar className="text-[#FE654F] h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalAppointments}</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="text-green-500 h-3 w-3 mr-1" />
              <span className="text-green-500">+15%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
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
                    color: "#82ca9d",
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
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
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
            <CardTitle className="text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  count: {
                    label: "Users",
                    color: "#FED18C",
                  },
                }}
              >
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FED18C" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FED18C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area type="monotone" dataKey="count" stroke="#FED18C" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-red-50 border border-red-100 rounded-md">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <Bell className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-red-700">Critical Stock Alert</p>
                  <p className="text-sm text-red-600">5 products below minimum threshold</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-amber-50 border border-amber-100 rounded-md">
                <div className="p-2 bg-amber-100 rounded-full mr-3">
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-amber-700">Expiring Batches</p>
                  <p className="text-sm text-amber-600">12 batches expiring in next 30 days</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-md">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <Bell className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-blue-700">Security Alert</p>
                  <p className="text-sm text-blue-600">3 failed login attempts detected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
                <div className="text-sm text-green-500 font-medium">Active</div>
              </div>
              
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-xs text-gray-500">Staff</p>
                  </div>
                </div>
                <div className="text-sm text-green-500 font-medium">Active</div>
              </div>
              
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Robert Johnson</p>
                    <p className="text-xs text-gray-500">Lab Technician</p>
                  </div>
                </div>
                <div className="text-sm text-amber-500 font-medium">Away</div>
              </div>
              
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Sarah Williams</p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="text-sm text-green-500 font-medium">Active</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-sm text-healthhub-orange hover:underline">View All Users</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
