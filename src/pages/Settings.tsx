
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { UserCog, Settings as SettingsIcon, Bell } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-healthhub-blue/20">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="w-full max-w-4xl">
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <SecuritySettings />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
