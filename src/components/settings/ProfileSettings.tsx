
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { UserCog } from 'lucide-react';

const ProfileSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@healthhub.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'System Administrator',
    department: 'IT',
    avatarUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    }, 1000);
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-healthhub-blue p-2 rounded-full">
          <UserCog className="h-6 w-6 text-healthhub-orange" />
        </div>
        <div>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                {formData.avatarUrl ? (
                  <AvatarImage src={formData.avatarUrl} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-2xl bg-healthhub-yellow text-foreground">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm" type="button">
                Change Avatar
              </Button>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input 
                id="jobTitle" 
                name="jobTitle" 
                value={formData.jobTitle} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                name="department" 
                value={formData.department} 
                onChange={handleInputChange} 
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
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileSettings;
