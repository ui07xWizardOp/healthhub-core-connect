
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell } from 'lucide-react';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    stockAlerts: true,
    appointmentReminders: true,
    marketingEmails: false,
    systemUpdates: true,
  });

  const handleToggleChange = (name: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof notificationSettings]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved."
      });
    }, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-healthhub-blue p-2 rounded-full">
          <Bell className="h-6 w-6 text-healthhub-orange" />
        </div>
        <div>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch 
                id="emailNotifications" 
                checked={notificationSettings.emailNotifications}
                onCheckedChange={() => handleToggleChange('emailNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch 
                id="pushNotifications" 
                checked={notificationSettings.pushNotifications}
                onCheckedChange={() => handleToggleChange('pushNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" htmlFor="stockAlerts">Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Get alerts for low inventory</p>
              </div>
              <Switch 
                id="stockAlerts" 
                checked={notificationSettings.stockAlerts}
                onCheckedChange={() => handleToggleChange('stockAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" htmlFor="appointmentReminders">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminders for upcoming appointments</p>
              </div>
              <Switch 
                id="appointmentReminders" 
                checked={notificationSettings.appointmentReminders}
                onCheckedChange={() => handleToggleChange('appointmentReminders')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
              </div>
              <Switch 
                id="marketingEmails" 
                checked={notificationSettings.marketingEmails}
                onCheckedChange={() => handleToggleChange('marketingEmails')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" htmlFor="systemUpdates">System Updates</Label>
                <p className="text-sm text-muted-foreground">Receive system update notifications</p>
              </div>
              <Switch 
                id="systemUpdates" 
                checked={notificationSettings.systemUpdates}
                onCheckedChange={() => handleToggleChange('systemUpdates')}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? undefined : '#FE654F',
              color: '#FEFEFF'
            }}
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NotificationSettings;
