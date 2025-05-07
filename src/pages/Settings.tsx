
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import AccountSettings from '@/components/settings/AccountSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';

const Settings: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        
        {/* User Role Debug Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Current User Information</CardTitle>
            <CardDescription>
              Your current authentication and role information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">User Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">User ID:</span>
                    <span className="text-sm ml-2">{userProfile?.userid}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="text-sm ml-2">{userProfile?.firstname} {userProfile?.lastname}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className="text-sm ml-2">{userProfile?.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Profile Completed:</span>
                    <span className="text-sm ml-2">{userProfile?.profile_completed ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium">Roles and Permissions</h3>
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-500">Assigned Roles:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userProfile?.roles?.length ? (
                      userProfile.roles.map(role => (
                        <Badge key={role} variant="outline" className="bg-green-50">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-red-500">No roles assigned</span>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-500">Special Statuses:</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                    <div>
                      <Badge variant={userProfile?.isAdmin ? "default" : "outline"} 
                        className={userProfile?.isAdmin ? "bg-blue-600" : ""}>
                        Admin: {userProfile?.isAdmin ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={userProfile?.isStaff ? "default" : "outline"}
                        className={userProfile?.isStaff ? "bg-blue-600" : ""}>
                        Staff: {userProfile?.isStaff ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={userProfile?.isDoctor ? "default" : "outline"}
                        className={userProfile?.isDoctor ? "bg-blue-600" : ""}>
                        Doctor: {userProfile?.isDoctor ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={userProfile?.isCustomer ? "default" : "outline"}
                        className={userProfile?.isCustomer ? "bg-blue-600" : ""}>
                        Customer: {userProfile?.isCustomer ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {userProfile?.isDoctor && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-500">Doctor Information:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Doctor ID:</span>
                        <span className="text-sm ml-2">{userProfile.doctorId}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Specialization:</span>
                        <span className="text-sm ml-2">{userProfile.specialization || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium">Complete Profile Data</h3>
                <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-60">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="account" className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-4">
            <AccountSettings />
          </TabsContent>
          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings />
          </TabsContent>
          <TabsContent value="security" className="space-y-4">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
