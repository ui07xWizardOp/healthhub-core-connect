
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, ArrowDown, ArrowUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Pharmacy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="healthhub-container py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Pharmacy Management</h1>
              <p className="text-gray-600">Manage inventory, prescriptions, and orders</p>
            </div>
            <Button className="healthhub-button mt-4 md:mt-0">
              <Plus size={18} className="mr-2" /> Add Medicine
            </Button>
          </div>

          <Tabs defaultValue="inventory" className="mb-8">
            <TabsList className="bg-healthhub-blue/20">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory" className="mt-6">
              <Card className="bg-white">
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-healthhub-orange/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter size={16} /> Filter
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ArrowDown size={16} className="mr-1" /> Sort
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Name</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Category</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Stock</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Price</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Expiry</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Paracetamol", category: "Analgesics", stock: 120, price: "$5.99", expiry: "2025-10-15" },
                          { name: "Amoxicillin", category: "Antibiotics", stock: 85, price: "$12.50", expiry: "2025-08-20" },
                          { name: "Loratadine", category: "Antihistamines", stock: 65, price: "$8.75", expiry: "2025-11-30" },
                          { name: "Omeprazole", category: "Antacids", stock: 95, price: "$15.25", expiry: "2025-09-25" },
                          { name: "Ibuprofen", category: "NSAIDs", stock: 150, price: "$6.49", expiry: "2025-12-10" }
                        ].map((medicine, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{medicine.name}</td>
                            <td className="p-3">{medicine.category}</td>
                            <td className="p-3">{medicine.stock}</td>
                            <td className="p-3">{medicine.price}</td>
                            <td className="p-3">{medicine.expiry}</td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">Edit</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prescriptions" className="mt-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Prescriptions Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage and track patient prescriptions</p>
                  <div className="flex justify-center p-8">
                    <p className="text-gray-500">This feature is coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Orders Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Track customer and supplier orders</p>
                  <div className="flex justify-center p-8">
                    <p className="text-gray-500">This feature is coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pharmacy;
