
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon } from 'lucide-react';

const SecuritySettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      });
    }, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-healthhub-blue p-2 rounded-full">
          <SettingsIcon className="h-6 w-6 text-healthhub-orange" />
        </div>
        <div>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Update your password and security preferences</CardDescription>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword" 
              name="currentPassword" 
              type="password" 
              value={passwordData.currentPassword} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              name="newPassword" 
              type="password" 
              value={passwordData.newPassword} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              value={passwordData.confirmPassword} 
              onChange={handleInputChange} 
            />
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
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SecuritySettings;
