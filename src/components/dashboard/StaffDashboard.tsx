
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PillIcon, 
  ShoppingCart,
  Search,
  User,
  Calendar,
  TestTube,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    lowStockItems: 0,
    recentSales: [],
    expiringBatches: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch low stock items count
        const { data: lowStock, error: lowStockError } = await supabase
          .from('products')
          .select('productid, productname, quantityinstock')
          .lt('reorderthreshold', 10)
          .limit(5);
        
        if (lowStockError) throw lowStockError;

        // Fetch recent sales (simplified for MVP)
        const { data: recentSales, error: salesError } = await supabase
          .from('sales')
          .select(`
            saleid, 
            saledate, 
            netamount,
            customerid,
            status
          `)
          .order('saledate', { ascending: false })
          .limit(10);
        
        if (salesError) throw salesError;

        // Fetch expiring batches
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const { count: expiringCount, error: expiringError } = await supabase
          .from('batchinventory')
          .select('*', { count: 'exact', head: true })
          .lt('expirydate', thirtyDaysFromNow.toISOString())
          .gt('quantityinstock', 0);
        
        if (expiringError) throw expiringError;

        setStats({
          lowStockItems: lowStock?.length || 0,
          recentSales: recentSales || [],
          expiringBatches: expiringCount || 0
        });
      } catch (error: any) {
        console.error('Error fetching staff dashboard data:', error.message);
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
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-10 w-64" />
          </div>
        </div>
      </div>
      
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200">
              <ShoppingCart className="h-6 w-6" />
              <span>New Sale</span>
            </Button>
            
            <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
              <ShoppingCart className="h-6 w-6" />
              <span>Create Purchase Order</span>
            </Button>
            
            <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200">
              <TestTube className="h-6 w-6" />
              <span>Register Lab Order</span>
            </Button>
            
            <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200">
              <Calendar className="h-6 w-6" />
              <span>Book Appointment</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sales</CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading recent sales...</p>
            ) : stats.recentSales.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No recent sales found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Sale ID</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Date</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Amount</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Customer</th>
                      <th className="text-left text-sm font-medium text-gray-500 p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSales.map((sale: any) => (
                      <tr key={sale.saleid} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2">#{sale.saleid}</td>
                        <td className="p-2">{new Date(sale.saledate).toLocaleDateString()}</td>
                        <td className="p-2">${parseFloat(sale.netamount).toFixed(2)}</td>
                        <td className="p-2">Customer #{sale.customerid}</td>
                        <td className="p-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            sale.status === 'Returned' ? 'bg-red-100 text-red-800' : 
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-red-50 border border-red-100 rounded-md">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-red-700">Low Stock Items</p>
                  <p className="text-sm text-red-600">{stats.lowStockItems} products below threshold</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-amber-50 border border-amber-100 rounded-md">
                <div className="p-2 bg-amber-100 rounded-full mr-3">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-amber-700">Expiring Soon</p>
                  <p className="text-sm text-amber-600">{stats.expiringBatches} batches expire in 30 days</p>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="default">Generate Purchase Order</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Customer Lookup</CardTitle>
          <CardDescription>Search for customer profiles and prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by name, phone or email..." className="pl-10" />
            </div>
            <Button>Search</Button>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Recent Customers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div 
                  key={item}
                  className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Customer {item}</p>
                    <p className="text-xs text-gray-500">Last visit: {new Date().toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
