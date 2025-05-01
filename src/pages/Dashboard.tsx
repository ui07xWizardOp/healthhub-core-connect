
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Medication, Flask, Users, ShoppingCart } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Medicines</CardTitle>
            <Medication className="text-healthhub-orange h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,245</div>
            <p className="text-xs text-green-500 mt-1">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lab Tests</CardTitle>
            <Flask className="text-healthhub-orange h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">587</div>
            <p className="text-xs text-green-500 mt-1">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Customers</CardTitle>
            <Users className="text-healthhub-orange h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,428</div>
            <p className="text-xs text-green-500 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Orders</CardTitle>
            <ShoppingCart className="text-healthhub-orange h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">825</div>
            <p className="text-xs text-green-500 mt-1">+10% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="pharmacy" className="mb-8">
        <TabsList className="bg-healthhub-blue/20">
          <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
          <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
        </TabsList>
        <TabsContent value="pharmacy" className="mt-6">
          <Card className="bg-white">
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
          <Card className="bg-white">
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
  );
};

export default Dashboard;
