
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, User } from "lucide-react";

interface EmployeeFormProps {
  employee?: any;
  onClose: () => void;
}

const EmployeeForm = ({ employee, onClose }: EmployeeFormProps) => {
  const isEditing = !!employee;
  
  const [formData, setFormData] = useState({
    firstname: employee?.firstname || '',
    lastname: employee?.lastname || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    username: employee?.username || '',
    passwordhash: employee ? 'unchanged' : '',
    isactive: employee ? employee.isactive : true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Don't send the password if it hasn't been changed
      const dataToSubmit = { ...formData };
      if (isEditing && dataToSubmit.passwordhash === 'unchanged') {
        delete dataToSubmit.passwordhash;
      }
      
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('users')
          .update(dataToSubmit)
          .eq('userid', employee.userid);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('users')
          .insert([dataToSubmit]);
          
        if (insertError) throw insertError;
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      setError(err.message || 'An error occurred while saving the employee');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-healthhub-blue/20">
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordhash">
                  {isEditing ? 'New Password (leave blank to keep unchanged)' : 'Password'}
                </Label>
                <Input
                  id="passwordhash"
                  name="passwordhash"
                  type="password"
                  value={formData.passwordhash}
                  onChange={handleChange}
                  required={!isEditing}
                  placeholder={isEditing ? '••••••••' : ''}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isactive"
                  name="isactive"
                  checked={formData.isactive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-healthhub-orange focus:ring-healthhub-orange"
                />
                <Label htmlFor="isactive">Active</Label>
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4 bg-gray-50 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-healthhub-orange hover:bg-healthhub-orange/90"
            >
              <Check className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EmployeeForm;
