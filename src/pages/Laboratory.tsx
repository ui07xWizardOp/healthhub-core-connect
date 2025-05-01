
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Laboratory: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="healthhub-container py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Laboratory Management</h1>
              <p className="text-gray-600">Manage tests, results, and patient samples</p>
            </div>
            <Button className="healthhub-button mt-4 md:mt-0">
              <Plus size={18} className="mr-2" /> New Test
            </Button>
          </div>

          <Tabs defaultValue="tests" className="mb-8">
            <TabsList className="bg-healthhub-blue/20">
              <TabsTrigger value="tests">Test Catalog</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="samples">Sample Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tests" className="mt-6">
              <Card className="bg-white">
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search tests..."
                        className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-healthhub-orange/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter size={16} /> Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Test Name</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Category</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Duration</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Price</th>
                          <th className="text-left text-sm font-medium text-gray-500 p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Complete Blood Count", category: "Hematology", duration: "1 day", price: "$25.00" },
                          { name: "Lipid Panel", category: "Chemistry", duration: "1 day", price: "$35.00" },
                          { name: "Liver Function", category: "Chemistry", duration: "1 day", price: "$45.00" },
                          { name: "Thyroid Panel", category: "Endocrinology", duration: "2 days", price: "$65.00" },
                          { name: "HbA1c", category: "Diabetes", duration: "1 day", price: "$30.00" }
                        ].map((test, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{test.name}</td>
                            <td className="p-3">{test.category}</td>
                            <td className="p-3">{test.duration}</td>
                            <td className="p-3">{test.price}</td>
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
            
            <TabsContent value="results" className="mt-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Test Results Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage and track patient test results</p>
                  <div className="flex justify-center p-8">
                    <p className="text-gray-500">This feature is coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="samples" className="mt-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Sample Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Track and manage patient samples</p>
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

export default Laboratory;
