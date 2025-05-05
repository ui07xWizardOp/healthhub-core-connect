
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, TestTube, User } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';
import LabTechnicianDashboard from './LabTechnicianDashboard';
import CustomerDashboard from './CustomerDashboard';

const DashboardSelector: React.FC = () => {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">View Dashboard As:</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Admin</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Staff</span>
              </TabsTrigger>
              <TabsTrigger value="labtech" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <span>Lab Tech</span>
              </TabsTrigger>
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Customer</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="mt-6">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="staff" className="mt-6">
              <StaffDashboard />
            </TabsContent>
            <TabsContent value="labtech" className="mt-6">
              <LabTechnicianDashboard />
            </TabsContent>
            <TabsContent value="customer" className="mt-6">
              <CustomerDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSelector;
