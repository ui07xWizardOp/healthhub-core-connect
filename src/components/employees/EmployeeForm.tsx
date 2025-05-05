
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

// Define form schema
const employeeFormSchema = z.object({
  firstname: z.string().min(2, 'First name must be at least 2 characters'),
  lastname: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.string().min(1, 'Please select a role'),
  isactive: z.boolean().default(true),
});

const EmployeeForm = ({ employee }: { employee?: any }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Array<{roleid: number, rolename: string}>>([]);
  
  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstname: employee?.firstname || '',
      lastname: employee?.lastname || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      address: employee?.address || '',
      username: employee?.username || '',
      password: '',
      role: employee?.role || '',
      isactive: employee?.isactive !== undefined ? employee.isactive : true
    }
  });
  
  useEffect(() => {
    // Fetch roles
    const fetchRoles = async () => {
      const { data, error } = await supabase.from('userroles').select('*');
      if (error) {
        toast({ title: 'Error', description: 'Could not load user roles' });
      } else if (data) {
        setRoles(data);
      }
    };
    
    fetchRoles();
  }, [toast]);
  
  const onSubmit = async (values: z.infer<typeof employeeFormSchema>) => {
    setIsLoading(true);
    
    try {
      // Create data object to submit, omitting password if it's empty
      const dataToSubmit: any = {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phone: values.phone,
        address: values.address,
        username: values.username,
        isactive: values.isactive
      };
      
      // Only include password hash if creating a new user or updating password
      if (values.password) {
        dataToSubmit.passwordhash = values.password;
      }
      
      if (employee) {
        // Update existing employee
        const { error: updateError } = await supabase
          .from('users')
          .update(dataToSubmit)
          .eq('userid', employee.userid);
          
        if (updateError) throw updateError;
      } else {
        // Fix: Need to generate a userid for new users
        // Since we can't actually generate a proper userid here (that's done by the database),
        // we'll modify our insert approach
        
        // Insert into users table using RPC function instead of direct insert
        // This assumes you have a function `create_user` in your database
        const { error: insertError } = await supabase.rpc('create_user', {
          p_firstname: values.firstname,
          p_lastname: values.lastname,
          p_email: values.email,
          p_phone: values.phone || null,
          p_address: values.address || null,
          p_username: values.username,
          p_passwordhash: values.password,
          p_role: values.role,
          p_isactive: values.isactive
        });
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Success',
        description: `Employee ${employee ? 'updated' : 'created'} successfully`
      });
      
      navigate('/employees');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save employee'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{employee ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.roleid} value={role.rolename}>
                          {role.rolename}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isactive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Whether this employee account is active
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/employees')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-healthhub-blue hover:bg-healthhub-blue/90"
            >
              {isLoading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EmployeeForm;
